import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* Başlık kartı */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-4">
          <div className="h-2 bg-blue-600" />
          <div className="p-8">
            <h1 className="text-3xl font-semibold text-gray-800 mb-3">
              🏊 Her Kulaç Bir nefes TDP - Yüzme Bilinci Anketi
            </h1>
            <p className="text-gray-500 text-base leading-relaxed">
              Bu anket, toplumda yüzme bilinci ve su güvenliği farkındalığını ölçmek amacıyla hazırlanmıştır.
              Cevaplarınız anonim olarak saklanmakta ve yalnızca araştırma amaçlı kullanılmaktadır.
            </p>
          </div>
        </div>

        {/* Bilgi kartı */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Anket Hakkında</h2>
          <div className="space-y-3 text-gray-600 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 font-bold mt-0.5">●</span>
              <p><strong>3 bölüm</strong> ve toplam <strong>20 soru</strong> bulunmaktadır: Evet/Hayır, Katılım Düzeyi ve Bilgi soruları.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-600 font-bold mt-0.5">●</span>
              <p>Tamamlanması yaklaşık <strong>3-5 dakika</strong> sürmektedir.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-600 font-bold mt-0.5">●</span>
              <p>Bilgi sorularında anketi bitirince <strong>kendi skorunuzu</strong> görebilirsiniz.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-600 font-bold mt-0.5">●</span>
              <p>Tüm sorular zorunludur, lütfen her soruyu eksiksiz cevaplayınız.</p>
            </div>
          </div>
        </div>

        {/* Bölümler kartı */}
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

        <div className="flex gap-3">
          <Link href="/survey" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-6 rounded-lg font-medium transition-colors text-sm">
            Ankete Başla
          </Link>
        </div>

      </div>
    </div>
  )
}