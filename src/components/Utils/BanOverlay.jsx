import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export default function BanOverlay({
  banTimeLeft,
  setBanTimeLeft,
  isForgivenButNicoNot,
  setIsForgivenButNicoNot,
  isKickingOut,
  setIsKickingOut,
  banHistory,
  setBanHistory,
  lastWords,
  setLastWords,
  isCheckingApology,
  setIsCheckingApology,
  banInputHidden,
  setBanInputHidden,
  banHistoryEndRef,
  handleApologySubmit
}) {
  const progressPercent = (banTimeLeft / 180) * 100;
  const colorClass = isForgivenButNicoNot ? 'text-blue-500' : isKickingOut ? 'text-red-500' : 'text-orange-500';
  const borderClass = isForgivenButNicoNot ? 'border-blue-500' : isKickingOut ? 'border-red-500' : 'border-orange-500';
  const bgClass = isForgivenButNicoNot ? 'bg-blue-500' : isKickingOut ? 'bg-red-500' : 'bg-orange-500';
  const timerColorClass = isForgivenButNicoNot ? 'text-blue-400' : isKickingOut ? 'text-red-400' : 'text-orange-400';
  const headerTitle = isForgivenButNicoNot
    ? 'Nico & Calm Mia Hamada'
    : isKickingOut
      ? 'Anger Nico & Mad Mia Hamada'
      : 'Mad Nico & Mia Hamada';

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-lg flex flex-col items-center justify-center p-6 text-center font-sans select-none animate-in fade-in duration-500">
      <div className="w-[360px] h-[500px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)] bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans">

        {/* Header styled like chat but with Nico Mode details */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="flex -space-x-2.5">
                <div className={`w-8 h-8 rounded-full overflow-hidden border ${borderClass} flex items-center justify-center bg-zinc-950 shrink-0 aspect-square z-10`}>
                  <img
                    src="/nico.webp"
                    alt="Nico Avatar"
                    className="w-full h-full object-cover aspect-square select-none pointer-events-none"
                    draggable="false"
                    onContextMenu={(e) => e.preventDefault()}
                    onMouseDown={(e) => e.preventDefault()}
                  />
                </div>
                <div className={`w-8 h-8 rounded-full overflow-hidden border ${borderClass} flex items-center justify-center bg-zinc-950 shrink-0 aspect-square`}>
                  <img
                    src="/mia.webp"
                    alt="Mia Avatar"
                    className="w-full h-full object-cover aspect-square select-none pointer-events-none"
                    draggable="false"
                    onContextMenu={(e) => e.preventDefault()}
                    onMouseDown={(e) => e.preventDefault()}
                  />
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 ring-1 ring-zinc-900 z-20" />
            </div>
            <div className="text-left">
              <h4 className={`text-sm font-semibold ${colorClass}`}>{headerTitle}</h4>
              <p className="text-[10px] font-mono text-zinc-500">Closed Door</p>
            </div>
          </div>
        </div>

        {/* Progress Bar & Timer */}
        <div className="w-full px-4 pt-3 flex flex-col gap-1.5 shrink-0 bg-zinc-900/40">
          <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
            <span>{isForgivenButNicoNot ? "We're preparing seat for you!" : isKickingOut ? "User time before kick out..." : "Redirecting to browser home..."}</span>
            <span className={`${timerColorClass} font-semibold`}>{banTimeLeft}s</span>
          </div>
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${bgClass} transition-all duration-1000 ease-linear`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Message List (Bubble Chat layout) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col scrollbar-thin bg-zinc-900/20" style={{ overscrollBehavior: 'contain' }}>
          {banHistory.map((item, idx) => {
            if (item.sender === 'system') {
              return (
                <div key={idx} className="flex w-full justify-start">
                  <div className="max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed bg-zinc-800/40 border border-zinc-800/60 text-zinc-400 italic rounded-tl-none text-left">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <span className="inline">{children}</span>,
                        em: ({ children }) => <em className="text-zinc-500/80 italic font-normal">{children}</em>
                      }}
                    >
                      {item.content}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            }

            const isUser = item.sender === 'user';
            const isMia = item.sender === 'mia';
            const isNicoWhite = item.content.includes("We don't accept bad attitude") || item.content === '...';

            const userBgClass = isForgivenButNicoNot ? 'bg-blue-600' : isKickingOut ? 'bg-red-600' : 'bg-orange-600';
            const nicoTextClass = isForgivenButNicoNot ? 'text-blue-400' : isKickingOut ? 'text-red-400' : 'text-orange-400';

            return (
              <div
                key={idx}
                className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${isUser
                    ? `${userBgClass} text-white rounded-tr-none font-medium text-right`
                    : (isMia || isNicoWhite)
                      ? 'bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-tl-none text-left'
                      : `bg-zinc-800 border border-zinc-700 ${nicoTextClass} rounded-tl-none text-left`
                    }`}
                >
                  {isUser ? (
                    item.content
                  ) : (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="leading-relaxed">{children}</p>,
                        em: ({ children }) => <em className="text-zinc-400/70 opacity-70 italic font-normal">{children}</em>,
                        strong: ({ children }) => <strong className="font-semibold text-red-400">{children}</strong>
                      }}
                    >
                      {item.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            );
          })}
          {isCheckingApology && (
            <div className="flex w-full justify-start">
              <div className="bg-zinc-800 border border-zinc-700 text-zinc-500 rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={banHistoryEndRef} />
        </div>

        {/* Apology Form / Actions */}
        {!banInputHidden && (
          <div className="p-3 border-t border-zinc-800 bg-zinc-900">
            <form onSubmit={handleApologySubmit} className="flex gap-2 w-full">
              <input
                type="text"
                value={lastWords}
                onChange={(e) => setLastWords(e.target.value)}
                placeholder={isCheckingApology ? "Checking..." : "Apologize sincerely..."}
                disabled={isCheckingApology || isKickingOut}
                className={`flex-1 bg-zinc-950 border border-zinc-800 ${isForgivenButNicoNot ? 'focus:border-blue-500/40' : isKickingOut ? 'focus:border-red-500/40' : 'focus:border-orange-500/40'} rounded-xl px-4 py-2.5 text-sm outline-none text-zinc-200 placeholder:text-zinc-600 transition-colors disabled:opacity-50`}
              />
              <button
                type="submit"
                disabled={isCheckingApology || isKickingOut || !lastWords.trim()}
                className={`px-4 py-2.5 ${isForgivenButNicoNot ? 'bg-blue-600 hover:bg-blue-500' : isKickingOut ? 'bg-red-600 hover:bg-red-500' : 'bg-orange-600 hover:bg-orange-500'} disabled:bg-zinc-800 text-white rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none`}
              >
                Submit
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
