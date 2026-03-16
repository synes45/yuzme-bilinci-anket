'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'
import { getAllResponses, SurveyResponse, clearAllData } from '@/lib/storage'
import { useCallback } from 'react'
import { yesNoQuestions, scaleQuestions, mcQuestions, scaleLabels } from '@/lib/questions'

const YES_NO_COLORS = ['#2563eb', '#ef4444']

function formatDuration(ms: number) {
  if (ms < 60000) return `${Math.round(ms / 1000)} sn`
  return `${Math.round(ms / 60000)} dk ${Math.round((ms % 60000) / 1000)} sn`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function AnalysisPage() {
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [filterFast, setFilterFast] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'yesno' | 'scale' | 'knowledge' | 'trends'>('overview')

  useEffect(() => { getAllResponses().then(setResponses) }, [])

  const filteredResponses = filterFast ? responses.filter(r => r.duration_ms >= 60000) : responses
  const total = filteredResponses.length

  if (total === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden w-full max-w-2xl">
          <div className="h-2 bg-blue-600" />
          <div className="p-10 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Henüz Yanıt Yok</h2>
            <p className="text-gray-500 text-sm mb-6">Analiz için en az bir anket doldurulması gerekiyor.</p>
            <Link href="/survey" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-lg text-sm font-medium transition-colors">
              Anketi Doldur
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Evet/Hayır
  const ynStats = yesNoQuestions.map(q => {
    const yes = filteredResponses.filter(r => r.answers[q.id] === 'Evet').length
    const no = total - yes
    return {
      id: q.id, text: q.text, yes, no,
      yesPercent: Math.round((yes / total) * 100),
      noPercent: Math.round((no / total) * 100),
      pieData: [{ name: 'Evet', value: yes }, { name: 'Hayır', value: no }],
    }
  })

  // Likert
  const scaleStats = scaleQuestions.map(q => {
    const counts = [0, 0, 0, 0, 0]
    filteredResponses.forEach(r => {
      const val = r.answers[q.id] as number
      if (val >= 1 && val <= 5) counts[val - 1]++
    })
    const avg = counts.reduce((sum, c, i) => sum + c * (i + 1), 0) / (total || 1)
    const barData = counts.map((c, i) => ({
      label: String(i + 1), count: c,
      percent: Math.round((c / (total || 1)) * 100),
    }))
    return { id: q.id, text: q.text, avg, barData, counts }
  })

  // Çoktan seçmeli
  const mcStats = mcQuestions.map(q => {
    const correctOption = q.options.find(o => o.correct)!
    const correctCount = filteredResponses.filter(r => r.answers[q.id] === correctOption.id).length
    const correctPercent = Math.round((correctCount / total) * 100)
    const optionCounts = q.options.map(opt => ({
      label: opt.id.slice(-1).toUpperCase(),
      text: opt.text,
      count: filteredResponses.filter(r => r.answers[q.id] === opt.id).length,
      correct: opt.correct,
    }))
    return { id: q.id, text: q.text, correctCount, correctPercent, optionCounts, correctOption }
  })

  const overallAvg = scaleStats.reduce((sum, s) => sum + s.avg, 0) / scaleStats.length
  const totalYes = ynStats.reduce((sum, s) => sum + s.yes, 0)
  const totalYesPercent = Math.round((totalYes / (total * yesNoQuestions.length)) * 100)
  const avgKnowledgeScore = mcStats.reduce((sum, s) => sum + s.correctPercent, 0) / mcStats.length

  const durations = filteredResponses.map(r => r.duration_ms).filter(d => d > 0 && d < 30 * 60 * 1000)
  const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : null
  const minDuration = durations.length > 0 ? Math.min(...durations) : null
  const maxDuration = durations.length > 0 ? Math.max(...durations) : null

  const dailyCounts: Record<string, number> = {}
  filteredResponses.forEach(r => {
    const day = new Date(r.submitted_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
    dailyCounts[day] = (dailyCounts[day] || 0) + 1
  })
  const dailyData = Object.entries(dailyCounts).map(([date, count]) => ({ date, count }))

  const hourlyCounts: Record<number, number> = {}
  filteredResponses.forEach(r => {
    const hour = new Date(r.submitted_at).getHours()
    hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1
  })
  const hourlyData = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, count: hourlyCounts[h] || 0 }))

  const trendData = filteredResponses.map((r, i) => {
    const scaleAvg = scaleQuestions.reduce((sum, q) => sum + ((r.answers[q.id] as number) || 0), 0) / scaleQuestions.length
    const yesCount = yesNoQuestions.filter(q => r.answers[q.id] === 'Evet').length
    const knowledgeScore = mcQuestions.filter(q => {
      const correct = q.options.find(o => o.correct)!
      return r.answers[q.id] === correct.id
    }).length
    return { name: `#${i + 1}`, scaleAvg: parseFloat(scaleAvg.toFixed(2)), yesCount, knowledgeScore }
  })

  const tabs = [
    { id: 'overview', label: '📋 Genel' },
    { id: 'yesno', label: '✅ Evet/Hayır' },
    { id: 'scale', label: '⭐ Likert' },
    { id: 'knowledge', label: '🧠 Bilgi' },
    { id: 'trends', label: '📈 Trend' },
  ] as const

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-4">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-2 bg-blue-600" />
          <div className="p-6">
            <Link href="/" className="text-blue-600 text-sm hover:underline mb-3 inline-block">← Geri</Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">📊 Anket Sonuçları</h1>
                <p className="text-gray-400 text-sm mt-1">Son yanıt: {formatDate(responses[responses.length - 1].submitted_at)}</p>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => setFilterFast(f => !f)} className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${filterFast ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300'}`}>
                  {filterFast ? "⚡ Hızlı yanıtlar gizlendi" : "⚡ Hızlı yanıtları gizle (<1 dk)"}
                </button>
                {filterFast && <span className="text-xs text-gray-400">{responses.length - filteredResponses.length} yanıt gizlendi</span>}
              </div>
              </div>
              {showClearConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-500">Emin misiniz?</span>
                  <button onClick={() => { clearAllData().then(() => setResponses([])); setShowClearConfirm(false) }} className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-xs font-medium transition-colors">Evet, Sil</button>
                  <button onClick={() => setShowClearConfirm(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 px-3 rounded-lg text-xs font-medium transition-colors">İptal</button>
                </div>
              ) : (
                <button onClick={() => setShowClearConfirm(true)} className="text-red-400 hover:text-red-500 text-xs font-medium transition-colors">
                  🗑️ Verileri Sıfırla
                </button>
              )}
              <Link href="/survey" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors text-center">
                + Yeni Yanıt
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Toplam Yanıt', value: total, icon: '👥', color: 'text-blue-600' },
            { label: 'Ort. Katılım', value: `${overallAvg.toFixed(1)}/5`, icon: '⭐', color: 'text-yellow-500' },
            { label: 'Bilgi Skoru', value: `%${Math.round(avgKnowledgeScore)}`, icon: '🧠', color: 'text-green-600' },
            { label: 'Ort. Süre', value: avgDuration ? formatDuration(avgDuration) : 'N/A', icon: '⏱️', color: 'text-purple-600' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="text-2xl mb-1">{card.icon}</div>
              <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* GENEL */}
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">📅 Günlük Katılım</h3>
                {dailyData.length > 1 ? (
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip formatter={(v: any) => [v, 'Yanıt']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: 'none' }} />
                        <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : <p className="text-xs text-gray-400">Trend için birden fazla güne ihtiyaç var.</p>}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">🕐 Saatlik Dağılım</h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={3} />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip formatter={(v: any) => [v, 'Yanıt']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: 'none' }} />
                      <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">⏱️ Tamamlanma Süresi</h3>
                {avgDuration ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'En Hızlı', value: formatDuration(minDuration!), color: 'text-green-600' },
                      { label: 'Ortalama', value: formatDuration(avgDuration), color: 'text-blue-600' },
                      { label: 'En Uzun', value: formatDuration(maxDuration!), color: 'text-orange-500' },
                    ].map(item => (
                      <div key={item.label} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                        <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{item.label}</div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-gray-400">Süre hesaplamak için en az 2 yanıt gerekli.</p>}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">🕑 Tüm Yanıtlar</h3>
                <div className="space-y-2">
                  {[...responses].reverse().slice(0, 5).map((r, i) => {
                    const score = mcQuestions.filter(q => r.answers[q.id] === q.options.find(o => o.correct)!.id).length
                    return (
                      <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
                            {responses.length - i}
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(r.submitted_at)}</span>
                        </div>
                        <div className="flex gap-3 text-xs text-gray-400">
                          <span>⏱️ {r.duration_ms ? formatDuration(r.duration_ms) : "—"}</span>
                          <span>✅ {yesNoQuestions.filter(q => r.answers[q.id] === 'Evet').length}/5</span>
                          <span>⭐ {(scaleQuestions.reduce((s, q) => s + ((r.answers[q.id] as number) || 0), 0) / scaleQuestions.length).toFixed(1)}</span>
                          <span>🧠 {score}/{mcQuestions.length}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* EVET/HAYIR */}
          {activeTab === 'yesno' && (
            <div className="divide-y divide-gray-50">
              {ynStats.map((stat, i) => (
                <div key={stat.id} className="p-6">
                  <p className="text-sm font-medium text-gray-700 mb-4">
                    <span className="text-gray-400 mr-2">{i + 1}.</span>{stat.text}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="flex-1 w-full space-y-2">
                      {[
                        { label: 'Evet', count: stat.yes, percent: stat.yesPercent, color: 'bg-blue-600' },
                        { label: 'Hayır', count: stat.no, percent: stat.noPercent, color: 'bg-red-500' },
                      ].map(row => (
                        <div key={row.label} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-10 text-right">{row.label}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                            <div className={`${row.color} h-6 rounded-full flex items-center justify-end pr-2`} style={{ width: `${Math.max(row.percent, 2)}%` }}>
                              {row.percent > 10 && <span className="text-xs text-white font-medium">%{row.percent}</span>}
                            </div>
                          </div>
                          <span className="text-xs font-medium text-gray-600 w-20">{row.count} kişi {row.percent <= 10 ? `(%${row.percent})` : ''}</span>
                        </div>
                      ))}
                    </div>
                    <div className="w-24 h-24 flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={stat.pieData} cx="50%" cy="50%" innerRadius={22} outerRadius={38} dataKey="value" paddingAngle={3}>
                            {stat.pieData.map((_, idx) => <Cell key={idx} fill={YES_NO_COLORS[idx]} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LİKERT */}
          {activeTab === 'scale' && (
            <div className="divide-y divide-gray-50">
              {scaleStats.map((stat, i) => (
                <div key={stat.id} className="p-6">
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <p className="text-sm font-medium text-gray-700">
                      <span className="text-gray-400 mr-2">{yesNoQuestions.length + i + 1}.</span>{stat.text}
                    </p>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-lg font-bold text-blue-600">{stat.avg.toFixed(2)}</span>
                      <span className="text-xs text-gray-400 block">/5 ort.</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                    </div>
                    <div className="relative h-2 bg-gray-100 rounded-full">
                      <div className="absolute h-2 bg-blue-600 rounded-full" style={{ width: `${((stat.avg - 1) / 4) * 100}%` }} />
                    </div>
                  </div>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stat.barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v: any) => [v, 'Kişi']} labelFormatter={(l: any) => scaleLabels[parseInt(l)]} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: 'none' }} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {stat.barData.map((_, idx) => <Cell key={idx} fill={['#ef4444','#f97316','#eab308','#22c55e','#2563eb'][idx]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Kesinlikle Katılmıyorum</span><span>Kesinlikle Katılıyorum</span>
                  </div>
                </div>
              ))}
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Tüm Sorular Karşılaştırması</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scaleStats.map((s, i) => ({ name: `S${i + 1}`, avg: parseFloat(s.avg.toFixed(2)), text: s.text }))} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <Tooltip labelFormatter={(l: any) => l} formatter={(v: any) => [v, 'Ortalama']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: 'none', maxWidth: 280 }} />
                      <Bar dataKey="avg" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* BİLGİ SORULARI */}
          {activeTab === 'knowledge' && (
            <div className="p-6 space-y-4">
              {/* Genel skor özeti */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="text-center sm:text-left">
                  <div className="text-3xl font-bold text-blue-600">%{Math.round(avgKnowledgeScore)}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Ortalama doğru oranı</div>
                </div>
                <div className="flex-1">
                  <div className="w-full bg-blue-100 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${avgKnowledgeScore}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>En zor soru: {mcStats.sort((a,b) => a.correctPercent - b.correctPercent)[0]?.text.slice(0,40)}...</span>
                  </div>
                </div>
              </div>

              {/* Soru bazlı doğru oranları */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mcStats.map((s, i) => ({ name: `S${i + 1}`, doğru: s.correctPercent, text: s.text }))}
                    margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} unit="%" />
                    <Tooltip
                      labelFormatter={(l: any) => l}
                      formatter={(v: any) => [`%${v}`, 'Doğru oranı']}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: 'none', maxWidth: 280 }}
                    />
                    <Bar dataKey="doğru" radius={[4, 4, 0, 0]}>
                      {mcStats.map((s, i) => (
                        <Cell key={i} fill={s.correctPercent >= 70 ? '#22c55e' : s.correctPercent >= 40 ? '#f97316' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-400 text-center">🟢 %70+ kolay &nbsp;🟠 %40-70 orta &nbsp;🔴 %40 altı zor</p>

              {/* Her soru detayı */}
              <div className="space-y-4 mt-2">
                {mcStats.map((stat, i) => (
                  <div key={stat.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className={`px-4 py-3 flex items-center justify-between gap-3 ${
                      stat.correctPercent >= 70 ? 'bg-green-50' : stat.correctPercent >= 40 ? 'bg-orange-50' : 'bg-red-50'
                    }`}>
                      <p className="text-sm font-medium text-gray-700 flex-1">
                        <span className="text-gray-400 mr-2">{i + 1}.</span>{stat.text}
                      </p>
                      <div className="flex-shrink-0 text-right">
                        <span className={`text-lg font-bold ${stat.correctPercent >= 70 ? 'text-green-600' : stat.correctPercent >= 40 ? 'text-orange-500' : 'text-red-500'}`}>
                          %{stat.correctPercent}
                        </span>
                        <div className="text-xs text-gray-400">doğru</div>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      {stat.optionCounts.map(opt => (
                        <div key={opt.label} className={`flex items-center gap-3 p-2.5 rounded-lg ${opt.correct ? 'bg-green-50 border border-green-100' : 'bg-gray-50'}`}>
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            opt.correct ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                          }`}>{opt.label}</span>
                          <span className={`text-xs flex-1 ${opt.correct ? 'text-green-700 font-medium' : 'text-gray-600'}`}>{opt.text}</span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${opt.correct ? 'bg-green-500' : 'bg-gray-400'}`}
                                style={{ width: `${Math.round((opt.count / total) * 100)}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 w-8 text-right">{opt.count} kişi</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TREND */}
          {activeTab === 'trends' && (
            <div className="p-6 space-y-8">
              {trendData.length < 2 ? (
                <p className="text-sm text-gray-400 text-center py-8">Trend grafikleri için en az 2 yanıt gerekli.</p>
              ) : (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Likert Ortalaması Trendi</h3>
                    <p className="text-xs text-gray-400 mb-4">Her yeni yanıtla birlikte likert sorularının ortalama puanı</p>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                          <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                          <Tooltip formatter={(v: any) => [v, 'Ort. Puan']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: 'none' }} />
                          <Line type="monotone" dataKey="scaleAvg" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb', r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Bilgi Skoru Trendi</h3>
                    <p className="text-xs text-gray-400 mb-4">Her yanıtta kaç bilgi sorusu doğru cevaplanmış (maks. {mcQuestions.length})</p>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, mcQuestions.length]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                          <Tooltip formatter={(v: any) => [v, 'Doğru Sayısı']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: 'none' }} />
                          <Line type="monotone" dataKey="knowledgeScore" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Evet Sayısı Trendi</h3>
                    <p className="text-xs text-gray-400 mb-4">Her yanıtta kaç soruya Evet denildi (maks. {yesNoQuestions.length})</p>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, yesNoQuestions.length]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                          <Tooltip formatter={(v: any) => [v, 'Evet Sayısı']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: 'none' }} />
                          <Line type="monotone" dataKey="yesCount" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="text-center text-xs text-gray-400 py-2">
          Toplam {total} yanıt · Son: {formatDate(responses[responses.length - 1].submitted_at)}
        </div>
      </div>
    </div>
  )
}
