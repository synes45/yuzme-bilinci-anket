'use client'

import { useState } from 'react'
import Link from 'next/link'
import { yesNoQuestions, scaleQuestions, mcQuestions, scaleLabels, Answers } from '@/lib/questions'
import { saveResponse, hasCompleted, markCompleted } from '@/lib/storage'

export default function SurveyPage() {
  const [answers, setAnswers] = useState<Answers>({})
  const [errors, setErrors] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [startedAt] = useState(() => new Date().toISOString())
  const [alreadyCompleted] = useState(() => hasCompleted())

  const totalQuestions = yesNoQuestions.length + scaleQuestions.length + mcQuestions.length
  const answeredCount = Object.keys(answers).length
  const progress = Math.round((answeredCount / totalQuestions) * 100)

  function setAnswer(id: string, value: string | number) {
    setAnswers(prev => ({ ...prev, [id]: value }))
    setErrors(prev => prev.filter(e => e !== id))
  }

  async function handleSubmit() {
    const missing: string[] = []
    yesNoQuestions.forEach(q => { if (!(q.id in answers)) missing.push(q.id) })
    scaleQuestions.forEach(q => { if (!(q.id in answers)) missing.push(q.id) })
    mcQuestions.forEach(q => { if (!(q.id in answers)) missing.push(q.id) })
    if (missing.length > 0) {
      setErrors(missing)
      document.getElementById(missing[0])?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setLoading(true)
    await saveResponse(answers, startedAt)
    markCompleted()
    setLoading(false)
    setSubmitted(true)
  }

  if (alreadyCompleted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden w-full max-w-2xl">
          <div className="h-2 bg-blue-600" />
          <div className="p-10 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Zaten Katıldınız</h2>
            <p className="text-gray-500 text-sm mb-6">Bu anketi daha önce doldurdunuz. Her tarayıcıdan yalnızca bir kez katılım yapılabilir.</p>
            <Link href="/analysis" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-lg text-sm font-medium transition-colors">
              Sonuçları Gör
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    const correctCount = mcQuestions.filter(q => {
      const selected = answers[q.id]
      return q.options.find(o => o.id === selected)?.correct
    }).length

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden w-full max-w-2xl">
          <div className="h-2 bg-blue-600" />
          <div className="p-10 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Cevaplarınız Kaydedildi!</h2>
            <p className="text-gray-500 mb-6">Ankete katıldığınız için teşekkür ederiz.</p>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
              <p className="text-sm text-gray-600 mb-1">Bilgi sorularındaki skorunuz</p>
              <p className="text-3xl font-bold text-blue-600">{correctCount} / {mcQuestions.length}</p>
              <p className="text-xs text-gray-400 mt-1">
                {correctCount === mcQuestions.length ? '🏆 Mükemmel!' :
                 correctCount >= 7 ? '👏 Çok iyi!' :
                 correctCount >= 5 ? '👍 Fena değil!' : '📚 Biraz daha çalışmak gerekiyor.'}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Link href="/" className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-2 px-5 rounded-lg text-sm font-medium transition-colors">
                Ana Sayfa
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-4">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-2 bg-blue-600" />
          <div className="p-6">
            <Link href="/" className="text-blue-600 text-sm hover:underline mb-3 inline-block">← Geri</Link>
            <h1 className="text-2xl font-semibold text-gray-800">🏊 Yüzme Bilinci Anketi</h1>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{answeredCount} / {totalQuestions} soru cevaplandı</span>
                <span>%{progress}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Bölüm 1 - Evet/Hayır */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-700">Bölüm 1 — Evet / Hayır</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {yesNoQuestions.map((q, i) => (
              <div key={q.id} id={q.id} className={`p-6 ${errors.includes(q.id) ? 'bg-red-50' : ''}`}>
                <p className="text-sm text-gray-700 mb-3 font-medium">
                  <span className="text-gray-400 mr-2">{i + 1}.</span>{q.text}
                  <span className="text-red-500 ml-1">*</span>
                </p>
                {errors.includes(q.id) && <p className="text-xs text-red-500 mb-2">Bu soruyu cevaplandırın</p>}
                <div className="flex gap-3">
                  {['Evet', 'Hayır'].map(opt => (
                    <button key={opt} onClick={() => setAnswer(q.id, opt)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        answers[q.id] === opt ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        answers[q.id] === opt ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                      }`}>
                        {answers[q.id] === opt && <span className="w-2 h-2 rounded-full bg-white" />}
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bölüm 2 - Likert */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-700">Bölüm 2 — Katılım Düzeyi</h2>
            <p className="text-xs text-gray-400 mt-1">1 = Kesinlikle Katılmıyorum → 5 = Kesinlikle Katılıyorum</p>
          </div>
          <div className="divide-y divide-gray-50">
            {scaleQuestions.map((q, i) => (
              <div key={q.id} id={q.id} className={`p-6 ${errors.includes(q.id) ? 'bg-red-50' : ''}`}>
                <p className="text-sm text-gray-700 mb-4 font-medium">
                  <span className="text-gray-400 mr-2">{yesNoQuestions.length + i + 1}.</span>{q.text}
                  <span className="text-red-500 ml-1">*</span>
                </p>
                {errors.includes(q.id) && <p className="text-xs text-red-500 mb-2">Bu soruyu cevaplandırın</p>}
                <div className="block sm:hidden space-y-2">
                  {[1,2,3,4,5].map(val => (
                    <button key={val} onClick={() => setAnswer(q.id, val)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm transition-all ${
                        answers[q.id] === val ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        answers[q.id] === val ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                      }`}>
                        {answers[q.id] === val && <span className="w-2 h-2 rounded-full bg-white" />}
                      </span>
                      <span className="font-semibold w-4">{val}</span>
                      <span className="text-xs text-gray-500">{scaleLabels[val]}</span>
                    </button>
                  ))}
                </div>
                <div className="hidden sm:block">
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(val => (
                      <button key={val} onClick={() => setAnswer(q.id, val)}
                        className={`flex-1 py-3 rounded-lg border text-sm font-semibold transition-all ${
                          answers[q.id] === val ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}>
                        {val}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between mt-1.5 px-1">
                    <span className="text-xs text-gray-400">Kesinlikle Katılmıyorum</span>
                    <span className="text-xs text-gray-400">Kesinlikle Katılıyorum</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bölüm 3 - Çoktan Seçmeli */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-700">Bölüm 3 — Bilgi Soruları</h2>
            <p className="text-xs text-gray-400 mt-1">Her soru için doğru olduğunu düşündüğünüz seçeneği işaretleyin.</p>
          </div>
          <div className="divide-y divide-gray-50">
            {mcQuestions.map((q, i) => (
              <div key={q.id} id={q.id} className={`p-6 ${errors.includes(q.id) ? 'bg-red-50' : ''}`}>
                <p className="text-sm text-gray-700 mb-3 font-medium">
                  <span className="text-gray-400 mr-2">{yesNoQuestions.length + scaleQuestions.length + i + 1}.</span>{q.text}
                  <span className="text-red-500 ml-1">*</span>
                </p>
                {errors.includes(q.id) && <p className="text-xs text-red-500 mb-2">Bu soruyu cevaplandırın</p>}
                <div className="space-y-2">
                  {q.options.map(opt => (
                    <button key={opt.id} onClick={() => setAnswer(q.id, opt.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm text-left transition-all ${
                        answers[q.id] === opt.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        answers[q.id] === opt.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-400'
                      }`}>
                        {opt.id.slice(-1).toUpperCase()}
                      </span>
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gönder */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {errors.length > 0 && (
            <p className="text-sm text-red-500 mb-4">⚠️ {errors.length} soru cevaplanmamış. Lütfen tüm soruları yanıtlayın.</p>
          )}
          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-medium text-sm transition-colors">
            {loading ? 'Kaydediliyor...' : 'Anketi Gönder'}
          </button>
          <p className="text-xs text-gray-400 text-center mt-3">Cevaplarınız anonim olarak kaydedilecektir.</p>
        </div>

      </div>
    </div>
  )
}
