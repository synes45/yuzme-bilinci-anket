export type YesNoQuestion = { id: string; type: 'yesno'; text: string }
export type ScaleQuestion = { id: string; type: 'scale'; text: string }
export type MultipleChoiceOption = { id: string; text: string; correct: boolean }
export type MultipleChoiceQuestion = { id: string; type: 'mc'; text: string; options: MultipleChoiceOption[] }
export type Question = YesNoQuestion | ScaleQuestion | MultipleChoiceQuestion

export const yesNoQuestions: YesNoQuestion[] = [
  { id: 'yn1', type: 'yesno', text: 'Sahile gitmeden önce hava durumunu kontrol eder misiniz?' },
  { id: 'yn2', type: 'yesno', text: 'Sahilde güvenlik uygulamalarının artırılması gerektiğini düşünüyor musunuz?' },
  { id: 'yn3', type: 'yesno', text: 'Cankurtaranın düdükle yaptığı uyarıları ve anonsları dikkate alır mısınız?' },
  { id: 'yn4', type: 'yesno', text: 'Acil bir durumda sahildeki görevlilere nasıl ulaşacağınızı biliyor musunuz?' },
  { id: 'yn5', type: 'yesno', text: 'Sahildeki cankurtaran bayraklarının (kırmızı, sarı-kırmızı vb.) anlamlarını biliyor musunuz?' },
]

export const scaleQuestions: ScaleQuestion[] = [
  { id: 'sc1', type: 'scale', text: 'Tekne, kano veya deniz bisikleti gibi araçlara bindiğimde, yüzme bilmeme rağmen can yeleği takmayı ihmal etmem.' },
  { id: 'sc2', type: 'scale', text: 'Derinliğini tam kestiremediğim veya dibini görmediğim bir suya (iskele, kayalık vb.) atlamam.' },
  { id: 'sc3', type: 'scale', text: 'Dalga ve akıntı gibi tehlikeler hakkında bilgi sahibiyim.' },
  { id: 'sc4', type: 'scale', text: 'Sahil güvenlik kurallarına insanların uyduğunu düşünüyorum.' },
  { id: 'sc5', type: 'scale', text: 'Yüzerken cankurtaranın belirlediği güvenlik sınırlarının (dubaların) içinde kalırım.' },
]

export const mcQuestions: MultipleChoiceQuestion[] = [
  {
    id: 'mc1', type: 'mc',
    text: 'Suda boğulma tehlikesi yaşayan bir kişi genellikle nasıl görünür?',
    options: [
      { id: 'mc1a', text: 'El sallayarak ve yüksek sesle yardım isteyerek.', correct: false },
      { id: 'mc1b', text: 'Düzensin haraketlerle suyun yüzeyinde kalmaya çalışır.', correct: true },
      { id: 'mc1c', text: 'Sırtüstü yatarak dinlenmeye çalışır.', correct: false },
    ]
  },
  {
    id: 'mc2', type: 'mc',
    text: 'Çocukların su kenarında güvenliğini sağlamak için en etkili önlem hangisidir?',
    options: [
      { id: 'mc2a', text: 'Sadece kolluk veya simit takmak.', correct: false },
      { id: 'mc2b', text: 'Yüzme bilse bile yetişkinin gözetiminde.', correct: true },
      { id: 'mc2c', text: 'Çocuğa çok iyi yüzme öğretmek.', correct: false },
    ]
  },
  {
    id: 'mc3', type: 'mc',
    text: 'Bilinci kapalı bir boğulma vakası sudan çıkarıldığında ilk ne yapılmalıdır?',
    options: [
      { id: 'mc3a', text: 'Karnına bastırarak yuttuğu suyu çıkarmaya çalışmak.', correct: false },
      { id: 'mc3b', text: 'Hemen temel yaşam desteğine başlamak.', correct: true },
      { id: 'mc3c', text: 'Hava yolunu açmak.', correct: false },
    ]
  },
  {
    id: 'mc4', type: 'mc',
    text: '"İkincil Boğulma" (Kuru Boğulma) durumunu en iyi hangisi açıklar?',
    options: [
      { id: 'mc4a', text: 'Su korkusu nedeniyle nefesin kesilmesi.', correct: false },
      { id: 'mc4b', text: 'Sudan çıktıktan saatler sonra akciğerlerde biriken suyun nefes darlığı yaratması.', correct: true },
      { id: 'mc4c', text: 'Yalnızca tuzlu suda gerçekleşen boğulma türü.', correct: false },
    ]
  },
  {
    id: 'mc5', type: 'mc',
    text: 'Denizde "çeken akıntı" (rip current) içine düşen bir yüzücü hangi yöne doğru yüzmelidir?',
    options: [
      { id: 'mc5a', text: 'Doğrudan kıyıya doğru, akıntıya karşı.', correct: false },
      { id: 'mc5b', text: 'Kıyıya paralel olarak sağa veya sola doğru.', correct: true },
      { id: 'mc5c', text: 'Denizin daha derinlerine doğru.', correct: false },
    ]
  },
  {
    id: 'mc6', type: 'mc',
    text: 'Sığ sulara (derinliği bilinmeyen) balıklama atlamanın en büyük riski nedir?',
    options: [
      { id: 'mc6a', text: 'Ani su yutulmasına bağlı boğulma refleksi.', correct: false },
      { id: 'mc6b', text: 'Boyun ve omurilikte hasar..', correct: true },
      { id: 'mc6c', text: 'Kulak zarının patlaması.', correct: false },
    ]
  },
  {
    id: 'mc7', type: 'mc',
    text: 'Can yeleği seçerken en önemli kriter ne olmalıdır?',
    options: [
      { id: 'mc7a', text: 'Renginin parlak olması.', correct: false },
      { id: 'mc7b', text: 'Kişinin kilosuna ve vücut yapısına tam uygunluğu.', correct: true },
      { id: 'mc7c', text: 'En pahalı ve çok cepli model olması.', correct: false },
    ]
  },
  {
    id: 'mc8', type: 'mc',
    text: 'Kurtarma operasyonlarında "Güvenlik Zinciri"ne göre ilk tercih hangisidir?',
    options: [
      { id: 'mc8a', text: 'Suya atlayıp kazazedeye sarılmak.', correct: false },
      { id: 'mc8b', text: 'Kıyıdan bir ip, sopa veya can simidi uzatmak.', correct: true },
      { id: 'mc8c', text: 'Tekneyle yanına yaklaşmak.', correct: false },
    ]
  },
  {
    id: 'mc9', type: 'mc',
    text: 'Boğulmakta olan birine neden arkadan yaklaşarak müdahale edilmelidir?',
    options: [
      { id: 'mc9a', text: 'Kazazedenin panikle kurtarıcıyı suyun altına çekmesini önlemek.', correct: true },
      { id: 'mc9b', text: 'Kişiyi daha hızlı yüzdürebilmek için.', correct: false },
      { id: 'mc9c', text: 'Kişinin yüzünü daha kolay görmek için.', correct: false },
    ]
  },
  {
    id: 'mc10', type: 'mc',
    text: 'Kurtarma sırasında kazazede size sıkıca sarılırsa ne yapmalısınız?',
    options: [
      { id: 'mc10a', text: 'Ona vurarak sizi bırakmasını sağlamak.', correct: false },
      { id: 'mc10b', text: 'Nefesinizi tutup su altına doğru dalış yapmak.', correct: true },
      { id: 'mc10c', text: 'Siz de ona sıkıca sarılmalısınız.', correct: false },
    ]
  },
]

export const scaleLabels: Record<number, string> = {
  1: 'Kesinlikle Katılmıyorum',
  2: 'Katılmıyorum',
  3: 'Kararsızım',
  4: 'Katılıyorum',
  5: 'Kesinlikle Katılıyorum',
}

export type Answers = Record<string, string | number>