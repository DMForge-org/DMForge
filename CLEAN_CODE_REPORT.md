# Clean Code Audit Report

- Target Directory: D:\Dev\Workspaces\Active\DMForge
- Timestamp: 2026-09-22 21:27:31
- Files Inspected: 130
- Errors: 5
- Warnings: 18

## Findings

| Severity | Category | Rule | File | Line | Snippet |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Warn** | Maintainability | Guard Clauses: Deep indentation pyramid (> 4 levels) | `app\best\[slug]\page.js` | 117 | `<span className={`font-display text-3xl font-bold ${i === 0 ? 'text-[#FF4D6D]' : 'text-[#A0A0C8]'}`}>#{i+1}</span>` |
| **Warn** | Maintainability | Guard Clauses: Deep indentation pyramid (> 4 levels) | `app\blog\[slug]\page.js` | 96 | `<div className="text-[10px] uppercase tracking-widest text-[#6B5BFF] font-semibold">{r.category}</div>` |
| **Warn** | Maintainability | Guard Clauses: Deep indentation pyramid (> 4 levels) | `app\blog\page.js` | 50 | `<span className="text-[10px] uppercase tracking-widest text-[#6B5BFF] font-semibold">{p.category}</span>` |
| **Warn** | Maintainability | Guard Clauses: Deep indentation pyramid (> 4 levels) | `app\dashboard\page.js` | 147 | `<div className="flex items-baseline justify-between">` |
| **Warn** | Maintainability | Guard Clauses: Deep indentation pyramid (> 4 levels) | `app\inbox\page.js` | 191 | `<div className="min-w-0">` |
| **Warn** | Maintainability | Guard Clauses: Deep indentation pyramid (> 4 levels) | `app\r\[id]\page.js` | 62 | `<div key={k}><dt className="text-[#A0A0C8] capitalize">{k}</dt><dd className="text-white font-medium">{v}</dd></div>` |
| **Warn** | Maintainability | Guard Clauses: Deep indentation pyramid (> 4 levels) | `app\settings\channels\page.js` | 135 | `{linkedinChannel?.connected` |
| **Warn** | Maintainability | Guard Clauses: Deep indentation pyramid (> 4 levels) | `app\settings\integrations\page.js` | 73 | `<div className="font-semibold">GoHighLevel connected</div>` |
| **Warn** | Maintainability | Guard Clauses: Deep indentation pyramid (> 4 levels) | `app\settings\team\page.js` | 89 | `<div key={m.uid} className="flex items-center justify-between bg-[#161630] border border-[#2A2A55] rounded-lg p-4">` |
| **Error** | Security | Parameterized SQL: Detected raw string concatenation in query | `app\settings\webhooks\page.js` | 134 | `<Button onClick={() => remove(w.id)} disabled={busy} variant="outline" aria-label={`Delete webhook ${w.url}`} className="bg-transparent border-[#2A2A55] shrink-0"><Trash2 className="w-4 h-4" /></Button>` |
| **Warn** | Maintainability | Guard Clauses: Deep indentation pyramid (> 4 levels) | `app\settings\webhooks\page.js` | 102 | `This is the only time it&apos;s shown. Verify each delivery by computing an HMAC-SHA256 of the raw` |
| **Warn** | Maintainability | Guard Clauses: Deep indentation pyramid (> 4 levels) | `app\settings\white-label\page.js` | 88 | `<input id="wl-primaryColor" type="color" aria-label="Primary color picker" value={wl.primaryColor} onChange={(e) => setWl({ ...wl, primaryColor: e.target.value })} className="h-10 w-14 bg-transparent border border-[#2A2A55] rounded" />` |
| **Warn** | Maintainability | Guard Clauses: Deep indentation pyramid (> 4 levels) | `app\vs\[slug]\page.js` | 85 | `<summary className="font-semibold cursor-pointer">{q}</summary>` |
| **Warn** | Maintainability | Guard Clauses: Deep indentation pyramid (> 4 levels) | `app\page.js` | 327 | `<td className="p-4 font-medium">{r[0]}</td>` |
| **Warn** | Maintainability | Guard Clauses: Deep indentation pyramid (> 4 levels) | `components\ui\calendar.jsx` | 126 | `className="flex size-[--cell-size] items-center justify-center text-center">` |
| **Warn** | Maintainability | Guard Clauses: Deep indentation pyramid (> 4 levels) | `components\ui\chart.jsx` | 167 | `"flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",` |
| **Warn** | Maintainability | Guard Clauses: Deep indentation pyramid (> 4 levels) | `components\auth-modal.jsx` | 94 | `Forgot password?` |
| **Warn** | Maintainability | Guard Clauses: Deep indentation pyramid (> 4 levels) | `components\support-chat.jsx` | 68 | `<div className={m.role === 'user'` |
| **Error** | Resilience | No Swallowed Errors: Empty catch block | `lib\analytics.js` | 19 | `} catch {}` |
| **Error** | Resilience | No Swallowed Errors: Empty catch block | `lib\llm.js` | 104 | `try { return JSON.parse(content) } catch {}` |
| **Error** | Resilience | No Swallowed Errors: Empty catch block | `lib\llm.js` | 105 | `try { return JSON.parse(repairLLMJson(content)) } catch {}` |
| **Error** | Resilience | No Swallowed Errors: Empty catch block | `lib\llm.js` | 108 | `try { return JSON.parse(repairLLMJson(m[0])) } catch {}` |
| **Warn** | Maintainability | Guard Clauses: Deep indentation pyramid (> 4 levels) | `backend_test.py` | 154 | `{"role": "assistant", "content": intro},` |
