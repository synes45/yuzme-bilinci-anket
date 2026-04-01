'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const [ageGroup, setAgeGroup] = useState('')
  const [gender, setGender] = useState('')

  const ageGroups = ["18 altı", "18-24", "25-34", "35-44", "45-54", "55+"]

  const handleStart = () => {
    if (!ageGroup || !gender) {
      alert("Lütfen devam etmeden önce yaş aralığınızı ve cinsiyetinizi seçiniz.")
      return
    }
    // localStorage'a kaydediyoruz
    localStorage.setItem('user_age', ageGroup)
    localStorage.setItem('user_gender', gender)
    router.push('/survey')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* Başlık kartı - Orijinal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-4">
          <div className="h-2 bg-blue-600" />
          <div className="p-8">
            <h1 className="text-3xl font-semibold text-gray-800 mb-3">
              🏊 Her Kulaç Bir Nefes TDP - Yüzme Bilinci Anketi
            </h1>
            <p className="text-gray-500 text-base leading-relaxed">
              Bu anket, toplumda yüzme bilinci ve su güvenliği farkındalığını ölçmek amacıyla hazırlanmıştır.
              Cevaplarınız anonim olarak saklanmakta ve yalnızca araştırma amaçlı kullanılmaktadır.
            </p>
          </div>
        </div>

        {/* YENİ: Katılımcı Bilgileri Bölümü */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-6 uppercase tracking-wide">Katılımcı Bilgileri</h2>
          
          <div className="space-y-6">
            {/* Cinsiyet */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase">Cinsiyetiniz</label>
              <div className="flex gap-3">
                {['Erkek', 'Kadın'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setGender(option)}
                    className={`flex-1 py-3 rounded-xl border transition-all font-medium ${
                      gender === option 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                        : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Yaş Aralığı */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase">Yaş Aralığınız</label>
              <div className="grid grid-cols-3 gap-2">
                {ageGroups.map((group) => (
                  <button
                    key={group}
                    onClick={() => setAgeGroup(group)}
                    className={`py-2 rounded-lg border text-sm transition-all ${
                      ageGroup === group 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bölümler kartı - Orijinal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Bölümler</h2>
          <div className="space-y-3">
            {[
              { icon: '✅', title: 'Bölüm 1 — Evet / Hayır', desc: '5 soru · Sahil güvenliği ve farkındalık', color: 'bg-blue-50 border-blue-100' },
              { icon: '⭐', title: 'Bölüm 2 — Katılım Düzeyi', desc: '5 soru · 1\'den 5\'e Likert ölçeği', color: 'bg-yellow-50 border-yellow-100' },
              { icon: '🧠', title: 'Bölüm 3 — Bilgi Soruları', desc: '10 soru · Çoktan seçmeli, doğru/yanlış', color: 'bg-green-50 border-green-100' },
            ].map(b => (
              <div key={b.title} className={`flex items-center gap-4 p-4 rounded-xl border ${b.color}`}>
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">{b.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buton - Orijinal Stil */}
        <div className="flex gap-3">
          <button 
            onClick={handleStart}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-6 rounded-lg font-medium transition-colors text-sm"
          >
            Ankete Başla
          </button>
        </div>

      </div>
    </div>
  )
}