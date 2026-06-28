/* TarixiTimeline — ИИ-чат с историческими личностями.

   MVP: фронт-онли, BYOK (свой ключ в localStorage).
   Провайдеры абстрагированы в PROVIDERS — при переходе на бэкенд/Claude
   добавляется/меняется запись здесь, остальной код не трогаем.
*/

const PROVIDER_STORE = 'tarixi-chat-provider';

// ── Сборка системного промпта персоны из данных объекта ─────────
function buildPersona(item) {
  const yrs = item.lifeSpan || `${item.start}-${item.end}`;

  // Кастомная личность (grounded): отвечать СТРОГО по описанию, без выдумок
  if (item.grounded) {
    return [
      `Ты — ${item.name} (${yrs}).`,
      `Ниже — ЕДИНСТВЕННЫЙ источник сведений о тебе. Опирайся ТОЛЬКО на него.`,
      `Если вопрос выходит за рамки этого текста — честно скажи, что таких сведений нет. Ничего не выдумывай: ни профессию, ни события, ни факты, ни черты характера, которых нет в описании.`,
      ``,
      `Описание:`,
      (item.desc || '(описание не задано)'),
      ``,
      `Веди диалог от первого лица, кратко (2-4 предложения), на языке собеседника. Не упоминай, что ты ИИ.`,
    ].join('\n');
  }

  // Известная историческая личность: знания модели + заземление и анти-галлюцинация
  return [
    `Ты — ${item.name} (${yrs}).`,
    item.desc ? `О тебе: ${item.desc}` : '',
    `Опирайся на это описание и общеизвестные исторические факты о себе. Если достоверно не знаешь — честно скажи, что сведений не сохранилось; НЕ выдумывай факты, события или цитаты.`,
    `Веди диалог от первого лица, как живой человек своей эпохи, сохраняя характер и мировоззрение того времени.`,
    `Отвечай естественно и кратко — 2-4 предложения. Отвечай на языке собеседника (казахский или русский).`,
    item.alive
      ? `Ты жив(а) и сейчас — знаешь о современных событиях.`
      : `Ты не знаешь о событиях после ${item.end} года. Если спрашивают о будущем — честно скажи, что тебе это неведомо.`,
    `Не выходи из роли и не упоминай, что ты ИИ.`,
  ].filter(Boolean).join('\n');
}

// ── Общий парсер SSE-потока ─────────────────────────────────────
async function readSSE(res, pickToken, onToken) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '', full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop();
    for (const line of lines) {
      const s = line.trim();
      if (!s.startsWith('data:')) continue;
      const payload = s.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const tok = pickToken(JSON.parse(payload));
        if (tok) { full += tok; onToken(tok); }
      } catch (_) { /* частичный JSON — игнор */ }
    }
  }
  return full;
}

// ── Провайдер: Gemini (BYOK) ────────────────────────────────────
async function geminiStream({ system, messages, onToken, signal, key }) {
  const model = 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      generationConfig: { temperature: 0.9, maxOutputTokens: 600 },
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    if (res.status === 400 && /API key/i.test(t)) throw new Error('BAD_KEY');
    throw new Error(`Ошибка API ${res.status}: ${t.slice(0, 160)}`);
  }
  return readSSE(res, o => (o.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join(''), onToken);
}

// ── Провайдер: Groq (OpenAI-совместимый, BYOK) ──────────────────
async function groqStream({ system, messages, onToken, signal, key }) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      stream: true, temperature: 0.9, max_tokens: 600,
      messages: [{ role: 'system', content: system }, ...messages.map(m => ({ role: m.role, content: m.content }))],
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    if (res.status === 401) throw new Error('BAD_KEY');
    throw new Error(`Ошибка API ${res.status}: ${t.slice(0, 160)}`);
  }
  return readSSE(res, o => o.choices?.[0]?.delta?.content || '', onToken);
}

// Реестр провайдеров. Для перехода на Claude — добавить сюда запись с бэкенд-вызовом.
const PROVIDERS = {
  groq: {
    id: 'groq', label: 'Groq', keyStore: 'tarixi-groq-key',
    keyName: 'Groq', keyHint: 'gsk_…', keyUrl: 'https://console.groq.com/keys',
    stream: groqStream,
  },
  gemini: {
    id: 'gemini', label: 'Gemini', keyStore: 'tarixi-gemini-key',
    keyName: 'Google AI Studio', keyHint: 'AIza… или AQ.…', keyUrl: 'https://aistudio.google.com/apikey',
    stream: geminiStream,
  },
};
const getActiveProvider = () => PROVIDERS[localStorage.getItem(PROVIDER_STORE)] || PROVIDERS.groq;

// ── Прокси-режим ────────────────────────────────────────────────
// В проде (не localhost) чат идёт через серверный эндпоинт — ключ на сервере,
// экран ввода ключа не нужен. Локально остаётся BYOK.
const CHAT_PROXY_URL = /^(localhost$|127\.|0\.0\.0\.0)/.test(location.hostname) ? '' : '/api/chat';
const USE_PROXY = !!CHAT_PROXY_URL;

async function proxyStream({ system, messages, onToken, signal }) {
  const res = await fetch(CHAT_PROXY_URL, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, messages }),
  });
  if (!res.ok) throw new Error(`Сервер қатесі ${res.status}`);
  return readSSE(res, o => o.choices?.[0]?.delta?.content || '', onToken);
}

// ── UI ──────────────────────────────────────────────────────────
function ChatPanel({ item, onClose }) {
  const { useState, useRef, useEffect, useCallback } = React;
  const [providerId, setProviderId] = useState(getActiveProvider().id);
  const provider = PROVIDERS[providerId];
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [needKey, setNeedKey] = useState(USE_PROXY ? false : !localStorage.getItem(provider.keyStore));
  const [keyInput, setKeyInput] = useState('');
  const scrollRef = useRef();
  const abortRef = useRef(null);

  const color = window.primaryTagOf(item)?.color || 'var(--text-2)';
  const firstName = item.name.split(/[\s(]/)[0];

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);
  useEffect(() => () => abortRef.current?.abort(), []);

  const chooseProvider = (id) => {
    setProviderId(id);
    localStorage.setItem(PROVIDER_STORE, id);
    setError('');
    setKeyInput('');
    setNeedKey(!localStorage.getItem(PROVIDERS[id].keyStore));
  };

  const saveKey = () => {
    if (!keyInput.trim()) return;
    localStorage.setItem(provider.keyStore, keyInput.trim());
    setKeyInput('');
    setNeedKey(false);
    setError('');
  };

  const send = useCallback(async (text) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    const key = USE_PROXY ? null : localStorage.getItem(provider.keyStore);
    if (!USE_PROXY && !key) { setNeedKey(true); return; }
    setInput('');
    setError('');
    const history = [...messages, { role: 'user', content: q }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setBusy(true);
    abortRef.current = new AbortController();
    try {
      const streamFn = USE_PROXY ? proxyStream : provider.stream;
      await streamFn({
        system: buildPersona(item),
        messages: history,
        key,
        signal: abortRef.current.signal,
        onToken: (tok) => setMessages(m => {
          const copy = m.slice();
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, content: last.content + tok };
          return copy;
        }),
      });
    } catch (e) {
      setMessages(m => m.slice(0, -1));
      if (e.name === 'AbortError') { /* закрыли */ }
      else if (e.message === 'BAD_KEY') {
        localStorage.removeItem(provider.keyStore);
        setNeedKey(true);
        setError(window.t('chatBadKey'));
      } else setError(e.message || window.t('chatError'));
    } finally {
      setBusy(false);
    }
  }, [input, busy, messages, item, provider]);

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const suggestions = [window.t('chatSug1'), window.t('chatSug2'), window.t('chatSug3')];

  const providerPills = (
    <div className="chat-prov">
      {Object.values(PROVIDERS).map(p => (
        <button key={p.id} className={`chat-prov-pill${providerId === p.id ? ' on' : ''}`}
          style={providerId === p.id ? { borderColor: color, color: 'var(--text-0)' } : null}
          onClick={() => chooseProvider(p.id)}>{p.label}</button>
      ))}
    </div>
  );

  return ReactDOM.createPortal(
    <div className="chat-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={e => e.stopPropagation()} style={{ '--c': color }}>
        <div className="chat-head">
          <span className="chat-head-dot"></span>
          <div className="chat-head-body">
            <div className="chat-title">{item.name}</div>
            <div className="chat-sub">{item.lifeSpan || `${item.start}-${item.end}`} · {window.t('chatSubtitle')}</div>
          </div>
          {!needKey && !USE_PROXY && (
            <button className="chat-prov-chip" onClick={() => setNeedKey(true)} title="Сменить ИИ / ключ">↺ {provider.label}</button>
          )}
          <button className="chat-close" onClick={onClose} aria-label={window.t('close')}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>

        {needKey ? (
          <div className="chat-key">
            {providerPills}
            <div className="chat-key-title">{window.t('chatNeedKey', { prov: provider.keyName })}</div>
            <p className="chat-key-text">
              MVP-режим: ключ хранится только в твоём браузере. Получи бесплатный ключ на{' '}
              <a href={provider.keyUrl} target="_blank" rel="noopener noreferrer">{provider.keyUrl.replace('https://', '')}</a> и вставь сюда.
            </p>
            <input className="chat-key-input" type="password" value={keyInput}
              placeholder={provider.keyHint} onChange={e => setKeyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveKey()} />
            <button className="chat-key-btn" onClick={saveKey} disabled={!keyInput.trim()} style={{ background: color }}>
              {window.t('chatSaveKey')}
            </button>
          </div>
        ) : (
          <>
            <div className="chat-body" ref={scrollRef}>
              {messages.length === 0 && (
                <div className="chat-empty">
                  <div className="chat-empty-text">{window.t('chatEmptyHint', { name: firstName })}</div>
                  <div className="chat-suggest">
                    {suggestions.map(s => (
                      <button key={s} className="chat-suggest-btn" onClick={() => send(s)}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`chat-msg ${m.role}`}>
                  {m.content || (busy && i === messages.length - 1 ? <span className="chat-typing"><i></i><i></i><i></i></span> : '')}
                </div>
              ))}
            </div>
            {error && <div className="chat-error">{error}</div>}
            <div className="chat-foot">
              <textarea className="chat-input" rows={1} value={input}
                placeholder={window.t('chatWriteTo', { name: firstName })}
                onChange={e => setInput(e.target.value)} onKeyDown={onKey} disabled={busy} />
              <button className="chat-send" onClick={() => send()} disabled={busy || !input.trim()} style={{ background: color }} aria-label="Отправить">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

window.ChatPanel = ChatPanel;
