import './style.css'

/** ========= 저장/유틸 ========= */
const LS_KEY = 'jp_starter_local_v5'

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
}
function save(s) { localStorage.setItem(LS_KEY, JSON.stringify(s)) }
function hardReset() { localStorage.removeItem(LS_KEY) }

function getTodayKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;')
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** ========= “조금 관대” 채점 ========= */
function normalizeKRPron(s) {
  return String(s || '')
    .replaceAll('·', '')
    .replaceAll('ー', '-') // 장음기호 넣는 경우
    .replaceAll('–', '-')
    .replaceAll('—', '-')
    .replaceAll('　', ' ')
    .replace(/\s+/g, '')
    .trim()
}

const H_BASE = 0xAC00
const H_END = 0xD7A3
const V_COUNT = 21
const T_COUNT = 28
const N_COUNT = V_COUNT * T_COUNT

// 초성 인덱스(19개): ㄱ ㄲ ㄴ ㄷ ㄸ ㄹ ㅁ ㅂ ㅃ ㅅ ㅆ ㅇ ㅈ ㅉ ㅊ ㅋ ㅌ ㅍ ㅎ
const L_EQUIV = {
  0:0,  1:0, 15:0, // ㄱ/ㄲ/ㅋ => ㄱ
  3:3,  4:3, 16:3, // ㄷ/ㄸ/ㅌ => ㄷ
  7:7,  8:7, 17:7, // ㅂ/ㅃ/ㅍ => ㅂ
  9:9, 10:9,        // ㅅ/ㅆ => ㅅ
  12:12, 13:12, 14:12 // ㅈ/ㅉ/ㅊ => ㅈ
}

function softenInitialHangul(str) {
  let out = ''
  for (const ch of str) {
    const code = ch.charCodeAt(0)
    if (code < H_BASE || code > H_END) { out += ch; continue }
    const sIndex = code - H_BASE
    const L = Math.floor(sIndex / N_COUNT)
    const V = Math.floor((sIndex % N_COUNT) / T_COUNT)
    const T = sIndex % T_COUNT

    const newL = (L in L_EQUIV) ? L_EQUIV[L] : L
    const newCode = H_BASE + (newL * N_COUNT) + (V * T_COUNT) + T
    out += String.fromCharCode(newCode)
  }
  return out
}

function normalizeLenient(s) {
  const base = normalizeKRPron(s).replaceAll('-', '')
  return softenInitialHangul(base)
}

function equalKRLenient(user, target) {
  const a = normalizeLenient(user)
  const b = normalizeLenient(target)
  return a && b && a === b
}

/** 틀렸을 때 장난스러운 문구(비하 없음) */
const WRONG_MESSAGES = [
  '앗! 아깝다 😅 다시 한 번!',
  '거의 다 왔어 💪 한 번만 더!',
  '괜찮아~ 복습이 실력이다 ✨',
  '오케이, 정답 보고 따라 써보자 🙂',
]
function pickWrongMsg() {
  return WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)]
}

/** ========= 히라/카타 “전부” ========= */
const HIRAGANA = [
  { ch: 'あ', rd: 'a' }, { ch: 'い', rd: 'i' }, { ch: 'う', rd: 'u' }, { ch: 'え', rd: 'e' }, { ch: 'お', rd: 'o' },
  { ch: 'か', rd: 'ka' }, { ch: 'き', rd: 'ki' }, { ch: 'く', rd: 'ku' }, { ch: 'け', rd: 'ke' }, { ch: 'こ', rd: 'ko' },
  { ch: 'さ', rd: 'sa' }, { ch: 'し', rd: 'shi' }, { ch: 'す', rd: 'su' }, { ch: 'せ', rd: 'se' }, { ch: 'そ', rd: 'so' },
  { ch: 'た', rd: 'ta' }, { ch: 'ち', rd: 'chi' }, { ch: 'つ', rd: 'tsu' }, { ch: 'て', rd: 'te' }, { ch: 'と', rd: 'to' },
  { ch: 'な', rd: 'na' }, { ch: 'に', rd: 'ni' }, { ch: 'ぬ', rd: 'nu' }, { ch: 'ね', rd: 'ne' }, { ch: 'の', rd: 'no' },
  { ch: 'は', rd: 'ha' }, { ch: 'ひ', rd: 'hi' }, { ch: 'ふ', rd: 'fu' }, { ch: 'へ', rd: 'he' }, { ch: 'ほ', rd: 'ho' },
  { ch: 'ま', rd: 'ma' }, { ch: 'み', rd: 'mi' }, { ch: 'む', rd: 'mu' }, { ch: 'め', rd: 'me' }, { ch: 'も', rd: 'mo' },
  { ch: 'や', rd: 'ya' }, { ch: 'ゆ', rd: 'yu' }, { ch: 'よ', rd: 'yo' },
  { ch: 'ら', rd: 'ra' }, { ch: 'り', rd: 'ri' }, { ch: 'る', rd: 'ru' }, { ch: 'れ', rd: 're' }, { ch: 'ろ', rd: 'ro' },
  { ch: 'わ', rd: 'wa' }, { ch: 'を', rd: 'wo' }, { ch: 'ん', rd: 'n' },
  { ch: 'が', rd: 'ga' }, { ch: 'ぎ', rd: 'gi' }, { ch: 'ぐ', rd: 'gu' }, { ch: 'げ', rd: 'ge' }, { ch: 'ご', rd: 'go' },
  { ch: 'ざ', rd: 'za' }, { ch: 'じ', rd: 'ji' }, { ch: 'ず', rd: 'zu' }, { ch: 'ぜ', rd: 'ze' }, { ch: 'ぞ', rd: 'zo' },
  { ch: 'だ', rd: 'da' }, { ch: 'ぢ', rd: 'ji' }, { ch: 'づ', rd: 'zu' }, { ch: 'で', rd: 'de' }, { ch: 'ど', rd: 'do' },
  { ch: 'ば', rd: 'ba' }, { ch: 'び', rd: 'bi' }, { ch: 'ぶ', rd: 'bu' }, { ch: 'べ', rd: 'be' }, { ch: 'ぼ', rd: 'bo' },
  { ch: 'ぱ', rd: 'pa' }, { ch: 'ぴ', rd: 'pi' }, { ch: 'ぷ', rd: 'pu' }, { ch: 'ぺ', rd: 'pe' }, { ch: 'ぽ', rd: 'po' },
  { ch: 'ぁ', rd: 'a' }, { ch: 'ぃ', rd: 'i' }, { ch: 'ぅ', rd: 'u' }, { ch: 'ぇ', rd: 'e' }, { ch: 'ぉ', rd: 'o' },
  { ch: 'ゃ', rd: 'ya' }, { ch: 'ゅ', rd: 'yu' }, { ch: 'ょ', rd: 'yo' }, { ch: 'っ', rd: 'tsu' },
]

const KATAKANA = [
  { ch: 'ア', rd: 'a' }, { ch: 'イ', rd: 'i' }, { ch: 'ウ', rd: 'u' }, { ch: 'エ', rd: 'e' }, { ch: 'オ', rd: 'o' },
  { ch: 'カ', rd: 'ka' }, { ch: 'キ', rd: 'ki' }, { ch: 'ク', rd: 'ku' }, { ch: 'ケ', rd: 'ke' }, { ch: 'コ', rd: 'ko' },
  { ch: 'サ', rd: 'sa' }, { ch: 'シ', rd: 'shi' }, { ch: 'ス', rd: 'su' }, { ch: 'セ', rd: 'se' }, { ch: 'ソ', rd: 'so' },
  { ch: 'タ', rd: 'ta' }, { ch: 'チ', rd: 'chi' }, { ch: 'ツ', rd: 'tsu' }, { ch: 'テ', rd: 'te' }, { ch: 'ト', rd: 'to' },
  { ch: 'ナ', rd: 'na' }, { ch: 'ニ', rd: 'ni' }, { ch: 'ヌ', rd: 'nu' }, { ch: 'ネ', rd: 'ne' }, { ch: 'ノ', rd: 'no' },
  { ch: 'ハ', rd: 'ha' }, { ch: 'ヒ', rd: 'hi' }, { ch: 'フ', rd: 'fu' }, { ch: 'ヘ', rd: 'he' }, { ch: 'ホ', rd: 'ho' },
  { ch: 'マ', rd: 'ma' }, { ch: 'ミ', rd: 'mi' }, { ch: 'ム', rd: 'mu' }, { ch: 'メ', rd: 'me' }, { ch: 'モ', rd: 'mo' },
  { ch: 'ヤ', rd: 'ya' }, { ch: 'ユ', rd: 'yu' }, { ch: 'ヨ', rd: 'yo' },
  { ch: 'ラ', rd: 'ra' }, { ch: 'リ', rd: 'ri' }, { ch: 'ル', rd: 'ru' }, { ch: 'レ', rd: 're' }, { ch: 'ロ', rd: 'ro' },
  { ch: 'ワ', rd: 'wa' }, { ch: 'ヲ', rd: 'wo' }, { ch: 'ン', rd: 'n' },
  { ch: 'ガ', rd: 'ga' }, { ch: 'ギ', rd: 'gi' }, { ch: 'グ', rd: 'gu' }, { ch: 'ゲ', rd: 'ge' }, { ch: 'ゴ', rd: 'go' },
  { ch: 'ザ', rd: 'za' }, { ch: 'ジ', rd: 'ji' }, { ch: 'ズ', rd: 'zu' }, { ch: 'ゼ', rd: 'ze' }, { ch: 'ゾ', rd: 'zo' },
  { ch: 'ダ', rd: 'da' }, { ch: 'ヂ', rd: 'ji' }, { ch: 'ヅ', rd: 'zu' }, { ch: 'デ', rd: 'de' }, { ch: 'ド', rd: 'do' },
  { ch: 'バ', rd: 'ba' }, { ch: 'ビ', rd: 'bi' }, { ch: 'ブ', rd: 'bu' }, { ch: 'ベ', rd: 'be' }, { ch: 'ボ', rd: 'bo' },
  { ch: 'パ', rd: 'pa' }, { ch: 'ピ', rd: 'pi' }, { ch: 'プ', rd: 'pu' }, { ch: 'ペ', rd: 'pe' }, { ch: 'ポ', rd: 'po' },
  { ch: 'ァ', rd: 'a' }, { ch: 'ィ', rd: 'i' }, { ch: 'ゥ', rd: 'u' }, { ch: 'ェ', rd: 'e' }, { ch: 'ォ', rd: 'o' },
  { ch: 'ャ', rd: 'ya' }, { ch: 'ュ', rd: 'yu' }, { ch: 'ョ', rd: 'yo' }, { ch: 'ッ', rd: 'tsu' },
  { ch: 'ー', rd: '-' },
]

// ✅ 기본 46개만 사용
const HIRA_46 = HIRAGANA.slice(0, 46)
const KATA_46 = KATAKANA.slice(0, 46)

/** ========= 히라/카타 발음(한글) ========= */
const ROMAJI_TO_KR = {
  a:'아', i:'이', u:'우', e:'에', o:'오',
  ka:'카', ki:'키', ku:'쿠', ke:'케', ko:'코',
  sa:'사', shi:'시', su:'스', se:'세', so:'소',
  ta:'타', chi:'치', tsu:'츠', te:'테', to:'토',
  na:'나', ni:'니', nu:'누', ne:'네', no:'노',
  ha:'하', hi:'히', fu:'후', he:'헤', ho:'호',
  ma:'마', mi:'미', mu:'무', me:'메', mo:'모',
  ya:'야', yu:'유', yo:'요',
  ra:'라', ri:'리', ru:'루', re:'레', ro:'로',
  wa:'와', wo:'오', n:'ㄴ',
  '-':'-',
}
const ROMAJI_ALT_KR = {
  shi: ['시','쉬'],
  chi: ['치','티'],
  tsu: ['츠','쓰'],
  fu:  ['후','푸'],
  n:   ['ㄴ','응'],
  wo:  ['오','워'],
}
function kanaAnswersKR(rd) {
  const key = (rd || '').toLowerCase()
  const base = ROMAJI_TO_KR[key]
  const alt = ROMAJI_ALT_KR[key] || []
  const out = []
  if (base) out.push(base)
  for (const a of alt) out.push(a)
  return [...new Set(out)]
}

/** ========= 동사 데이터 ========= */
function mkVerb(verb, meaning, kr, jpPairs, answerKR) {
  return {
    verb,
    meaning,
    example: {
      kr,
      jpTokens: jpPairs.map(([w, m]) => ({ w, m })),
      answerKR,
    }
  }
}

const VERBS = [
  mkVerb('いく', '가다', '나는 학교에 간다', [
    ['わたしは','나는'], ['がっこうに','학교에'], ['いきます','갑니다'],
  ], '와타시와 각꼬-니 이키마스'),
  mkVerb('くる', '오다', '친구가 집에 온다', [
    ['ともだちが','친구가'], ['いえに','집에'], ['きます','옵니다'],
  ], '토모다치가 이에니 키마스'),
  mkVerb('たべる', '먹다', '나는 빵을 먹는다', [
    ['わたしは','나는'], ['パンを','빵을'], ['たべます','먹습니다'],
  ], '와타시와 판오 타베마스'),
  mkVerb('のむ', '마시다', '나는 물을 마신다', [
    ['わたしは','나는'], ['みずを','물을'], ['のみます','마십니다'],
  ], '와타시와 미즈오 노미마스'),
  mkVerb('みる', '보다', '나는 영화를 본다', [
    ['わたしは','나는'], ['えいがを','영화를'], ['みます','봅니다'],
  ], '와타시와 에-가오 미마스'),
  mkVerb('きく', '듣다/묻다', '나는 음악을 듣는다', [
    ['わたしは','나는'], ['おんがくを','음악을'], ['ききます','듣습니다'],
  ], '와타시와 옹가쿠오 키키마스'),
  mkVerb('よむ', '읽다', '나는 책을 읽는다', [
    ['わたしは','나는'], ['ほんを','책을'], ['よみます','읽습니다'],
  ], '와타시와 혼오 요미마스'),
  mkVerb('かく', '쓰다', '나는 메모를 쓴다', [
    ['わたしは','나는'], ['メモを','메모를'], ['かきます','씁니다'],
  ], '와타시와 메모오 카키마스'),
  mkVerb('はなす', '말하다', '나는 일본어를 말한다', [
    ['わたしは','나는'], ['にほんごを','일본어를'], ['はなします','말합니다'],
  ], '와타시와 니홍고오 하나시마스'),
  mkVerb('かう', '사다', '나는 커피를 산다', [
    ['わたしは','나는'], ['コーヒーを','커피를'], ['かいます','삽니다'],
  ], '와타시와 코-히-오 카이마스'),
  mkVerb('あう', '만나다', '나는 친구를 만난다', [
    ['わたしは','나는'], ['ともだちに','친구를/친구에게'], ['あいます','만납니다'],
  ], '와타시와 토모다치니 아이마스'),
  mkVerb('まつ', '기다리다', '나는 여기서 기다린다', [
    ['わたしは','나는'], ['ここで','여기서'], ['まちます','기다립니다'],
  ], '와타시와 코코데 마치마스'),
  mkVerb('つくる', '만들다', '나는 저녁을 만든다', [
    ['わたしは','나는'], ['ばんごはんを','저녁을'], ['つくります','만듭니다'],
  ], '와타시와 방고항오 츠쿠리마스'),
  mkVerb('はたらく', '일하다', '나는 회사에서 일한다', [
    ['わたしは','나는'], ['かいしゃで','회사에서'], ['はたらきます','일합니다'],
  ], '와타시와 카이샤데 하타라키마스'),
  mkVerb('やすむ', '쉬다', '나는 오늘 쉰다', [
    ['わたしは','나는'], ['きょう','오늘'], ['やすみます','쉽니다'],
  ], '와타시와 쿄- 야스미마스'),
  mkVerb('ねる', '자다', '나는 11시에 잔다', [
    ['わたしは','나는'], ['11じに','11시에'], ['ねます','잡니다'],
  ], '와타시와 쥬-이치지니 네마스'),
  mkVerb('おきる', '일어나다', '나는 7시에 일어난다', [
    ['わたしは','나는'], ['7じに','7시에'], ['おきます','일어납니다'],
  ], '와타시와 시치지니 오키마스'),
  mkVerb('べんきょうする', '공부하다', '나는 일본어를 공부한다', [
    ['わたしは','나는'], ['にほんごを','일본어를'], ['べんきょうします','공부합니다'],
  ], '와타시와 니홍고오 벵쿄-시마스'),
  mkVerb('する', '하다', '나는 운동을 한다', [
    ['わたしは','나는'], ['うんどうを','운동을'], ['します','합니다'],
  ], '와타시와 운도-오 시마스'),
]

/** ========= 상태 모델 ========= */
function ensureState(s) {
  s.progress ??= { hiraIndex: 0, kataIndex: 0, verbIndex: 0 }

  s.kana ??= {
    sets: { hira: [], kata: [] },
    mem: { hira: {}, kata: {} },        // 현재 10개(챕터) 체크용
    totalMem: { hira: {}, kata: {} },   // 누적 외움 기록(퀴즈 출제 범위)
  }
  s.kana.mem ??= { hira: {}, kata: {} }
  s.kana.totalMem ??= { hira: {}, kata: {} }

  s.today ??= { key: null, sets: { verb: [] } }
  s.verbMem ??= { key: null, mem: {} }
  s.wrong ??= { key: null, hira: [], kata: [], verb: [] }

  // kana 세트 비어있으면 46개 풀에서 10개 생성
  if (!Array.isArray(s.kana.sets.hira) || s.kana.sets.hira.length === 0) {
    s.kana.sets.hira = takeN(HIRA_46, 'hiraIndex', s, 10, false)
  }
  if (!Array.isArray(s.kana.sets.kata) || s.kana.sets.kata.length === 0) {
    s.kana.sets.kata = takeN(KATA_46, 'kataIndex', s, 10, false)
  }

  // verbs: 날짜 바뀌면 다음 10개
  const t = getTodayKey()
  if (s.today.key !== t) {
    s.today.key = t
    s.today.sets.verb = takeN(VERBS, 'verbIndex', s, 10, true)
    s.verbMem.key = t
    s.verbMem.mem = {}
  }

  // 오답: 날짜 바뀌면 초기화
  if (s.wrong.key !== t) {
    s.wrong.key = t
    s.wrong.hira = []
    s.wrong.kata = []
    s.wrong.verb = []
  }
  return s
}

function takeN(pool, key, s, n, advance = true) {
  const total = pool.length
  const start = s.progress[key] || 0
  const out = []
  for (let i = 0; i < n; i++) out.push(pool[(start + i) % total])
  if (advance) s.progress[key] = (start + n) % total
  return out
}

/** ========= kana 챕터 진행 ========= */
function kanaCountDone(kind, state) {
  const set = kind === 'hira' ? state.kana.sets.hira : state.kana.sets.kata
  const mem = kind === 'hira' ? state.kana.mem.hira : state.kana.mem.kata
  return set.filter(x => mem[x.ch]).length
}

function advanceKanaChapter(kind) {
  const s = ensureState(load())

  if (kind === 'hira') {
    if (kanaCountDone('hira', s) !== s.kana.sets.hira.length) return false
    s.progress.hiraIndex = (s.progress.hiraIndex + 10) % HIRA_46.length
    s.kana.sets.hira = takeN(HIRA_46, 'hiraIndex', s, 10, false)
    s.kana.mem.hira = {}
  } else {
    if (kanaCountDone('kata', s) !== s.kana.sets.kata.length) return false
    s.progress.kataIndex = (s.progress.kataIndex + 10) % KATA_46.length
    s.kana.sets.kata = takeN(KATA_46, 'kataIndex', s, 10, false)
    s.kana.mem.kata = {}
  }

  save(s)
  return true
}

/** ========= 누적 외움 풀(퀴즈 출제 범위) ========= */
function getMemorizedKanaPool(kind, state) {
  const totalMem = kind === 'hira' ? state.kana.totalMem.hira : state.kana.totalMem.kata
  const pool = kind === 'hira' ? HIRA_46 : KATA_46
  return pool.filter(x => totalMem && totalMem[x.ch])
}

/** ========= 라우팅 ========= */
const app = document.querySelector('#app')
if (!app) throw new Error('Missing #app element')

let state = ensureState(load())
save(state)

function goto(route) {
  window.location.hash = route
  render()
}
window.addEventListener('hashchange', render)

/** ========= 탭 활성 ========= */
function activeTab(tab) {
  const route = window.location.hash.replace('#','') || 'home'
  if (route.startsWith('study')) return tab === 'study' ? 'active' : ''
  if (route.startsWith('quiz')) return tab === 'quiz' ? 'active' : ''
  if (route === 'menu' || route === 'wrong') return tab === 'menu' ? 'active' : ''
  return tab === 'home' ? 'active' : ''
}

/** ========= 공통 레이아웃 (탭바 포함) ========= */
function base(title, body) {
  app.innerHTML = `
    <div class="wrap">
      <div class="small muted" style="margin-bottom:6px;">찐초보 일본어</div>
      <h2 style="margin-bottom:14px;">${title}</h2>
      ${body}
    </div>

    <div class="tabbar">
      <div class="tab ${activeTab('home')}" data-tab="home">
        <div class="ico">🏠</div>
        홈
      </div>
      <div class="tab ${activeTab('study')}" data-tab="study">
        <div class="ico">📚</div>
        외우기
      </div>
      <div class="tab ${activeTab('quiz')}" data-tab="quiz">
        <div class="ico">📝</div>
        퀴즈
      </div>
      <div class="tab ${activeTab('menu')}" data-tab="menu">
        <div class="ico">☰</div>
        전체
      </div>
    </div>
  `
  document.querySelectorAll('.tab').forEach(t => {
    t.onclick = () => goto(t.dataset.tab)
  })
}

/** ========= 닉네임 ========= */
function renderNickname() {
  app.innerHTML = `
    <div class="wrap">
      <h1 style="margin-bottom:10px;">찐초보 일본어 스타터</h1>
      <p class="muted">닉네임만 정하면 바로 시작해요. (개인정보 없음)</p>
      <input class="input" id="nick" placeholder="닉네임" /></p>
      <button class="btn primary" id="startBtn">시작하기</button>
      <div class="muted small" style="margin-top:10px;">※ “전체 초기화”를 누르면 진도도 1번부터 다시 시작해요.</div>
    </div>
  `
  document.getElementById('startBtn').onclick = () => {
    const nick = document.getElementById('nick').value.trim()
    if (!nick) return
    const s = ensureState(load())
    s.nickname = nick
    save(s)
    goto('home')
  }
}

/** ========= 홈 ========= */
function renderHome() {
  const nick = escapeHtml(state.nickname)
  const tKey = state.today.key
  const w = state.wrong

  const hiraDone = Object.keys(state.kana.totalMem.hira || {}).filter(k => state.kana.totalMem.hira[k]).length
  const kataDone = Object.keys(state.kana.totalMem.kata || {}).filter(k => state.kana.totalMem.kata[k]).length

  base(
    `안녕, ${nick} 👋`,
    `
      <div class="card">
        <div class="muted small">오늘 날짜</div>
        <div style="font-size:18px;font-weight:900;margin-top:6px;">${tKey}</div>
      </div>

      <div class="card" style="margin-top:12px;">
        <div class="muted small">히라/카타 누적 진행</div>
        <div style="margin-top:8px;line-height:1.8;">
          히라: <b>${hiraDone}</b> / ${HIRA_46.length}<br/>
          카타: <b>${kataDone}</b> / ${KATA_46.length}
        </div>
        <div class="muted small" style="margin-top:10px;">
          ※ 학습은 “오늘의 10개(챕터)” / 퀴즈는 “지금까지 외운 것(누적)”에서만 출제
        </div>
      </div>

      <div class="card" style="margin-top:12px;">
        <div class="muted small">오늘 오답노트</div>
        <div style="margin-top:8px;">
          히라 <b>${w.hira.length}</b> · 카타 <b>${w.kata.length}</b> · 동사 <b>${w.verb.length}</b>
        </div>
        <button class="btn" id="goWrong" style="margin-top:12px;">오답 보기</button>
      </div>

      <div class="grid2" style="margin-top:12px;">
        <button class="btn primary" id="goStudy">외우기</button>
        <button class="btn primary" id="goQuiz">퀴즈</button>
      </div>
    `
  )

  document.getElementById('goWrong').onclick = () => goto('wrong')
  document.getElementById('goStudy').onclick = () => goto('study')
  document.getElementById('goQuiz').onclick = () => goto('quiz')
}

/** ========= 외우기 허브 ========= */
function renderStudyHub() {
  const hiraNow = kanaCountDone('hira', state)
  const kataNow = kanaCountDone('kata', state)
  const verbNow = (state.verbMem && state.verbMem.key === state.today.key)
    ? state.today.sets.verb.filter(v => state.verbMem.mem[v.verb]).length
    : 0

  base(
    '외우기',
    `
      <div class="card">
        <div class="muted small">오늘/현재 진행</div>
        <div style="margin-top:8px;line-height:1.9;">
          히라(현재 챕터): <b>${hiraNow}</b> / 10<br/>
          카타(현재 챕터): <b>${kataNow}</b> / 10<br/>
          동사(오늘): <b>${verbNow}</b> / 10
        </div>
      </div>

      <div class="grid" style="margin-top:12px;">
        <button class="btn primary" id="hiraStudy">히라가나 오늘의 10개</button>
        <button class="btn primary" id="kataStudy">카타카나 오늘의 10개</button>
        <button class="btn primary" id="verbStudy">동사 오늘의 10개</button>
      </div>
    `
  )

  document.getElementById('hiraStudy').onclick = () => goto('study-hira')
  document.getElementById('kataStudy').onclick = () => goto('study-kata')
  document.getElementById('verbStudy').onclick = () => goto('study-verb')
}

/** ========= 퀴즈 허브 ========= */
function renderQuizHub() {
  const hiraPool = getMemorizedKanaPool('hira', state).length
  const kataPool = getMemorizedKanaPool('kata', state).length
  base(
    '퀴즈',
    `
      <div class="card">
        <div class="muted small">출제 범위(누적 외움 기준)</div>
        <div style="margin-top:8px;line-height:1.9;">
          히라: <b>${hiraPool}</b>개 · 카타: <b>${kataPool}</b>개<br/>
          동사: <b>오늘의 10개</b>에서 출제
        </div>
      </div>

      <div class="grid" style="margin-top:12px;">
        <button class="btn primary" id="hiraQuiz">히라 퀴즈</button>
        <button class="btn primary" id="kataQuiz">카타 퀴즈</button>
        <button class="btn primary" id="verbQuiz">동사 문장 퀴즈</button>
      </div>
    `
  )
  document.getElementById('hiraQuiz').onclick = () => goto('quiz-hira')
  document.getElementById('kataQuiz').onclick = () => goto('quiz-kata')
  document.getElementById('verbQuiz').onclick = () => goto('quiz-verb')
}

/** ========= 전체(메뉴) ========= */
function renderMenu() {
  const hiraDone = Object.keys(state.kana.totalMem.hira || {}).filter(k => state.kana.totalMem.hira[k]).length
  const kataDone = Object.keys(state.kana.totalMem.kata || {}).filter(k => state.kana.totalMem.kata[k]).length

  base(
    '전체',
    `
      <div class="card">
        <div class="muted small">내 진행</div>
        <div style="margin-top:8px;line-height:1.9;">
          히라 누적: <b>${hiraDone}</b> / ${HIRA_46.length}<br/>
          카타 누적: <b>${kataDone}</b> / ${KATA_46.length}<br/>
          오늘 날짜: <b>${state.today.key}</b>
        </div>
      </div>

      <div class="grid" style="margin-top:12px;">
        <button class="btn" id="wrongBtn">오늘 오답노트</button>
        <button class="btn danger" id="resetAllBtn">전체 초기화</button>
      </div>

      <div class="card" style="margin-top:12px;">
        <div class="muted small">닉네임 변경</div>
        <div class="muted small" style="margin-top:8px;">지금 닉네임: <b>${escapeHtml(state.nickname || '')}</b></div>
        <input class="input" id="newNick" placeholder="새 닉네임" style="margin-top:10px;" />
        <button class="btn primary" id="saveNick" style="margin-top:10px;">저장</button>
      </div>
    `
  )

  document.getElementById('wrongBtn').onclick = () => goto('wrong')
  document.getElementById('resetAllBtn').onclick = () => { hardReset(); render() }

  document.getElementById('saveNick').onclick = () => {
    const v = document.getElementById('newNick').value.trim()
    if (!v) return
    const s = ensureState(load())
    s.nickname = v
    save(s)
    render()
  }
}

/** ========= 학습(히라/카타): 외움 버튼 ========= */
function setKanaMem(kind, ch, value) {
  const s = ensureState(load())
  if (kind === 'hira') {
    s.kana.mem.hira[ch] = value
    s.kana.totalMem.hira[ch] = value
  } else {
    s.kana.mem.kata[ch] = value
    s.kana.totalMem.kata[ch] = value
  }
  save(s)
}

function renderKanaStudy(kind) {
  const isHira = kind === 'hira'
  const title = isHira ? '히라가나 오늘의 10개' : '카타카나 오늘의 10개'
  const items = isHira ? state.kana.sets.hira : state.kana.sets.kata
  const mem = isHira ? state.kana.mem.hira : state.kana.mem.kata

  const doneCount = items.filter(x => mem[x.ch]).length
  const allDone = doneCount === items.length

  const cards = items.map(x => {
    const done = !!mem[x.ch]
    return `
      <div class="row">
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="big">${x.ch}</div>
          <div class="mid">${x.rd}</div>
        </div>
        <button class="btn ${done ? '' : 'primary'}" data-ch="${escapeHtml(x.ch)}" ${done ? 'disabled' : ''}>
          ${done ? '외움완료' : '외움'}
        </button>
      </div>
    `
  }).join('')

  base(
    title,
    `
      <div class="card">
        <div class="muted small">외움 진행(현재 챕터)</div>
        <div style="margin-top:8px;font-size:18px;"><b>${doneCount}</b> / 10</div>
        <div class="muted small" style="margin-top:10px;">
          ※ 퀴즈에서 틀리면(현재 챕터 글자면) 자동으로 외움이 풀립니다.
        </div>
      </div>

      <div class="list">${cards}</div>

      <div class="card" style="margin-top:12px;">
        <div class="muted small">다음 10개</div>
        <div class="muted small" style="margin-top:8px;">10개 외움완료가 되야 버튼이 활성화돼요.</div>
        <button class="btn ${allDone ? 'primary' : ''}" id="nextKanaBtn" ${allDone ? '' : 'disabled'} style="margin-top:10px;">
          다음 10개 보기
        </button>
      </div>
    `
  )

  document.querySelectorAll('button[data-ch]').forEach(btn => {
    btn.onclick = () => {
      const ch = btn.getAttribute('data-ch')
      setKanaMem(kind, ch, true)
      render()
      goto(isHira ? 'study-hira' : 'study-kata')
    }
  })

  document.getElementById('nextKanaBtn').onclick = () => {
    const ok = advanceKanaChapter(kind)
    if (!ok) return
    render()
    goto(isHira ? 'study-hira' : 'study-kata')
  }
}

/** ========= 학습(동사) ========= */
function setVerbMem(verb, value) {
  const s = ensureState(load())
  if (s.verbMem.key !== s.today.key) {
    s.verbMem.key = s.today.key
    s.verbMem.mem = {}
  }
  s.verbMem.mem[verb] = value
  save(s)
}

function renderVerbStudy() {
  const items = state.today.sets.verb
  const mem = (state.verbMem && state.verbMem.key === state.today.key) ? state.verbMem.mem : {}
  const doneCount = items.filter(v => mem[v.verb]).length

  const cards = items.map(v => {
    const tokens = v.example.jpTokens.map(t => `
      <span class="jpword" data-meaning="${escapeHtml(t.m)}">${escapeHtml(t.w)}</span>
    `).join(' ')
    const done = !!mem[v.verb]
    return `
      <div class="card" style="margin-top:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
          <div style="font-weight:900;">${escapeHtml(v.verb)} <span class="muted" style="font-weight:700;">(${escapeHtml(v.meaning)})</span></div>
          <button class="btn ${done ? '' : 'primary'}" data-verb="${escapeHtml(v.verb)}" ${done ? 'disabled' : ''}>
            ${done ? '외움완료' : '외움'}
          </button>
        </div>
        <div style="margin-top:10px;"><b>Q.</b> ${escapeHtml(v.example.kr)}</div>
        <div class="jpLine" style="margin-top:10px;">${tokens}</div>
        <div class="muted small" style="margin-top:10px;"><b>발음(한글)</b>: ${escapeHtml(v.example.answerKR)}</div>
      </div>
    `
  }).join('')

  base(
    '동사 오늘의 10개',
    `
      <div class="card">
        <div class="muted small">외움 진행</div>
        <div style="margin-top:8px;font-size:18px;"><b>${doneCount}</b> / 10</div>
        <div class="muted small" style="margin-top:10px;">
          ※ 동사는 <b>하루 10개</b>만. 날짜 바뀌면 자동으로 다음 10개!
        </div>
        <div class="muted small" style="margin-top:8px;">
          ※ 퀴즈에서 틀리면 해당 동사는 자동으로 외움이 풀립니다.
        </div>
      </div>

      <div class="muted small" style="margin-top:10px;">일본어 단어를 누르면 뜻이 떠요.</div>
      ${cards}
      ${toastHtml()}
    `
  )

  bindWordToast()

  document.querySelectorAll('button[data-verb]').forEach(btn => {
    btn.onclick = () => {
      const verb = btn.getAttribute('data-verb')
      setVerbMem(verb, true)
      render()
      goto('study-verb')
    }
  })
}

/** ========= 퀴즈(히라/카타) ========= */
function pushWrongKana(kind, ch) {
  const s = ensureState(load())
  const list = (kind === 'hira') ? s.wrong.hira : s.wrong.kata
  if (!list.includes(ch)) list.push(ch)

  // 현재 챕터에 있는 글자라면 외움 풀기(챕터 진행 제한용)
  const set = (kind === 'hira') ? s.kana.sets.hira : s.kana.sets.kata
  const isInCurrent = set.some(x => x.ch === ch)
  if (isInCurrent) {
    if (kind === 'hira') delete s.kana.mem.hira[ch]
    else delete s.kana.mem.kata[ch]
  }
  // totalMem은 유지
  save(s)
}

function renderKanaQuiz(kind) {
  const isHira = kind === 'hira'
  const title = isHira ? '히라가나 퀴즈' : '카타카나 퀴즈'
  const pool = getMemorizedKanaPool(kind, state)

  if (!pool || pool.length === 0) {
    base(
      title,
      `
        <div class="card">
          <div style="font-weight:900;">아직 외움완료한 글자가 없어요 😅</div>
          <div class="muted" style="margin-top:10px;line-height:1.7;">
            먼저 <b>${isHira ? '히라가나' : '카타카나'} 오늘의 10개</b>에서
            몇 개라도 <b>외움</b>을 눌러 완료한 뒤 퀴즈를 시작해 주세요.
          </div>
          <button class="btn primary" id="goStudy" style="margin-top:12px;">외우러 가기</button>
        </div>
      `
    )
    document.getElementById('goStudy').onclick = () => goto(isHira ? 'study-hira' : 'study-kata')
    return
  }

  base(
    title,
    `
      <div class="card">
        <div class="muted small">문제 수 선택</div>
        <div class="grid2" style="margin-top:10px;">
          <button class="btn" data-n="10">10문제</button>
          <button class="btn" data-n="20">20문제</button>
          <button class="btn" data-n="50">50문제</button>
        </div>
        <div class="muted small" style="margin-top:10px;">
          ※ 정답은 <b>한글 발음</b>으로 입력 (예: か→카, し→시, つ→츠)
        </div>
        <div class="muted small" style="margin-top:8px;">
          ※ 출제: <b>누적 외움</b> 기준 (현재 ${pool.length}개)
        </div>
      </div>

      <div id="quizArea" style="margin-top:12px;"></div>
    `
  )

  document.querySelectorAll('button[data-n]').forEach(btn => {
    btn.onclick = () => startKanaQuiz(pool, Number(btn.dataset.n), kind)
  })
}

function startKanaQuiz(todayPool, n, kind) {
  const questions = []
  const shuffled = shuffle(todayPool)
  for (let i = 0; i < n; i++) {
    const item = shuffled[i % shuffled.length]
    questions.push({ prompt: item.ch, rd: item.rd })
  }

  let idx = 0
  let correct = 0
  const quizArea = document.getElementById('quizArea')

  function isCorrect(userInput, rd) {
    const candidates = kanaAnswersKR(rd)
    return candidates.some(ans => equalKRLenient(userInput, ans))
  }

  function renderQ() {
    const q = questions[idx]
    quizArea.innerHTML = `
      <div class="card">
        <div class="muted small">문제 ${idx + 1} / ${questions.length}</div>
        <div style="font-size:52px;font-weight:900;margin:14px 0;">${q.prompt}</div>

        <input class="input" id="ans" placeholder="발음을 한글로 입력 (예: 카, 시, 츠)" />
        <div class="grid2" style="margin-top:10px;">
          <button class="btn primary" id="checkBtn">채점</button>
          <button class="btn" id="skipBtn">모르겠음</button>
        </div>

        <div id="feedback" class="muted" style="margin-top:12px;"></div>
      </div>
    `
    const ans = document.getElementById('ans')
    ans.focus()

    document.getElementById('checkBtn').onclick = () => {
      const user = ans.value
      const ok = isCorrect(user, q.rd)
      if (ok) correct += 1
      else pushWrongKana(kind, q.prompt)

      const right = kanaAnswersKR(q.rd)[0] || '?'
      document.getElementById('feedback').innerHTML = ok
        ? `<b>정답!</b> ✅`
        : `<b>오답</b> ❌ 정답: <b>${escapeHtml(right)}</b><div style="margin-top:8px;">${pickWrongMsg()}</div>`

      document.getElementById('checkBtn').textContent = (idx === questions.length - 1) ? '결과 보기' : '다음'
      document.getElementById('checkBtn').onclick = () => {
        idx += 1
        if (idx >= questions.length) return renderResult()
        renderQ()
      }
    }

    document.getElementById('skipBtn').onclick = () => {
      pushWrongKana(kind, q.prompt)
      const right = kanaAnswersKR(q.rd)[0] || '?'
      document.getElementById('feedback').innerHTML =
        `정답: <b>${escapeHtml(right)}</b><div style="margin-top:8px;">${pickWrongMsg()}</div>`
      document.getElementById('checkBtn').textContent = (idx === questions.length - 1) ? '결과 보기' : '다음'
    }
  }

  function renderResult() {
    const score = Math.round((correct / questions.length) * 100)
    quizArea.innerHTML = `
      <div class="card">
        <h3 style="margin-top:0;">결과</h3>
        <div style="font-size:18px;">맞춘 개수: <b>${correct}</b> / ${questions.length}</div>
        <div style="font-size:38px;font-weight:900;margin-top:10px;">${score}점</div>
        <button class="btn primary" id="againBtn" style="margin-top:12px;">다시 풀기</button>
      </div>
    `
    document.getElementById('againBtn').onclick = () => startKanaQuiz(todayPool, questions.length, kind)
  }

  renderQ()
}

/** ========= 동사 퀴즈 ========= */
function pushWrongVerb(verb) {
  const s = ensureState(load())
  if (!s.wrong.verb.includes(verb)) s.wrong.verb.push(verb)
  if (s.verbMem && s.verbMem.key === s.today.key) delete s.verbMem.mem[verb]
  save(s)
}

function renderVerbQuiz() {
  const pool = state.today.sets.verb

  base(
    '동사 문장 퀴즈',
    `
      <div class="card">
        <div class="muted small">문제 수 선택</div>
        <div class="grid2" style="margin-top:10px;">
          <button class="btn" data-n="10">10문제</button>
          <button class="btn" data-n="20">20문제</button>
          <button class="btn" data-n="50">50문제</button>
        </div>
        <div class="muted small" style="margin-top:10px;line-height:1.7;">
          ※ 정답은 <b>발음을 한글로</b> 입력. 장음은 <b>-</b>로 표기(채점은 - 있어도/없어도 OK)<br/>
          ※ 외움완료여도 틀리면 해당 동사는 <b>외움이 풀립니다</b>.
        </div>
      </div>

      <div id="quizArea" style="margin-top:12px;"></div>
    `
  )

  document.querySelectorAll('button[data-n]').forEach(btn => {
    btn.onclick = () => startVerbQuiz(pool, Number(btn.dataset.n))
  })
}

function startVerbQuiz(todayPool, n) {
  const questions = []
  const shuffled = shuffle(todayPool)
  for (let i = 0; i < n; i++) questions.push(shuffled[i % shuffled.length])

  let idx = 0
  let correct = 0
  const quizArea = document.getElementById('quizArea')

  function renderQ() {
    const v = questions[idx]
    const answerTokens = v.example.jpTokens.map(t => `
      <span class="jpword" data-meaning="${escapeHtml(t.m)}">${escapeHtml(t.w)}</span>
    `).join(' ')

    quizArea.innerHTML = `
      <div class="card">
        <div class="muted small">문제 ${idx + 1} / ${questions.length}</div>

        <div style="margin-top:10px;">
          <div class="muted small">동사</div>
          <div style="font-size:18px;font-weight:900;">${escapeHtml(v.verb)} <span class="muted" style="font-weight:700;">(${escapeHtml(v.meaning)})</span></div>
        </div>

        <div style="margin-top:12px;">
          <div class="muted small">한국어 문장</div>
          <div style="font-size:18px;"><b>${escapeHtml(v.example.kr)}</b></div>
        </div>

        <div style="margin-top:12px;">
          <input class="input" id="ans" placeholder="발음을 한글로 입력 (예: 와타시와 각꼬-니 이키마스)" />
        </div>

        <div class="grid2" style="margin-top:10px;">
          <button class="btn primary" id="checkBtn">채점</button>
          <button class="btn" id="hintBtn">정답 보기</button>
        </div>

        <div id="feedback" class="muted" style="margin-top:12px;"></div>

        <div id="answerBox" class="card" style="display:none;margin-top:12px;">
          <div class="muted small">정답(단어 누르면 뜻)</div>
          <div class="jpLine" style="margin-top:8px;">${answerTokens}</div>
          <div style="margin-top:10px;font-weight:900;">발음(한글): ${escapeHtml(v.example.answerKR)}</div>
        </div>
      </div>

      ${toastHtml()}
    `

    bindWordToast()
    const ans = document.getElementById('ans')
    ans.focus()

    document.getElementById('hintBtn').onclick = () => {
      document.getElementById('answerBox').style.display = 'block'
    }

    document.getElementById('checkBtn').onclick = () => {
      const ok = equalKRLenient(ans.value, v.example.answerKR)
      if (ok) correct += 1
      else pushWrongVerb(v.verb)

      document.getElementById('feedback').innerHTML = ok
        ? `<b>정답!</b> ✅`
        : `<b>오답</b> ❌ ${pickWrongMsg()}`

      document.getElementById('checkBtn').textContent = (idx === questions.length - 1) ? '결과 보기' : '다음'
      document.getElementById('checkBtn').onclick = () => {
        idx += 1
        if (idx >= questions.length) return renderResult()
        renderQ()
      }
    }
  }

  function renderResult() {
    const score = Math.round((correct / questions.length) * 100)
    quizArea.innerHTML = `
      <div class="card">
        <h3 style="margin-top:0;">결과</h3>
        <div style="font-size:18px;">맞춘 개수: <b>${correct}</b> / ${questions.length}</div>
        <div style="font-size:38px;font-weight:900;margin-top:10px;">${score}점</div>
        <button class="btn primary" id="againBtn" style="margin-top:12px;">다시 풀기</button>
      </div>
    `
    document.getElementById('againBtn').onclick = () => startVerbQuiz(todayPool, questions.length)
  }

  renderQ()
}

/** ========= 오답노트 ========= */
function renderWrong() {
  const w = state.wrong
  const hira = w.hira || []
  const kata = w.kata || []
  const verb = w.verb || []

  base(
    '오늘 오답노트',
    `
      <div class="card">
        <div class="muted small">히라가나</div>
        <div style="margin-top:10px;line-height:2;">
          ${hira.length ? hira.map(x => `<span class="chip">${escapeHtml(x)}</span>`).join('') : `<span class="muted">없음</span>`}
        </div>
      </div>

      <div class="card" style="margin-top:10px;">
        <div class="muted small">카타카나</div>
        <div style="margin-top:10px;line-height:2;">
          ${kata.length ? kata.map(x => `<span class="chip">${escapeHtml(x)}</span>`).join('') : `<span class="muted">없음</span>`}
        </div>
      </div>

      <div class="card" style="margin-top:10px;">
        <div class="muted small">동사</div>
        <div style="margin-top:10px;line-height:2;">
          ${verb.length ? verb.map(x => `<span class="chip">${escapeHtml(x)}</span>`).join('') : `<span class="muted">없음</span>`}
        </div>
      </div>

      <button class="btn" id="clearWrong" style="margin-top:12px;">오늘 오답 초기화</button>
    `
  )

  document.getElementById('clearWrong').onclick = () => {
    const s = ensureState(load())
    s.wrong.hira = []
    s.wrong.kata = []
    s.wrong.verb = []
    save(s)
    render()
  }
}

/** ========= 토스트 ========= */
function toastHtml() {
  return `<div id="toast">뜻</div>`
}

function bindWordToast() {
  const toast = document.getElementById('toast')
  if (!toast) return

  app.querySelectorAll('.jpword').forEach(el => {
    el.addEventListener('click', () => {
      const meaning = el.getAttribute('data-meaning') || ''
      toast.textContent = meaning
      toast.style.display = 'block'
      clearTimeout(window.__toastTimer)
      window.__toastTimer = setTimeout(() => (toast.style.display = 'none'), 1200)
    })
  })
}

/** ========= 메인 렌더 ========= */
function render() {
  state = ensureState(load())
  save(state)

  if (!state.nickname) return renderNickname()

  const route = window.location.hash.replace('#', '') || 'home'

  // 새 탭 라우트
  if (route === 'home') return renderHome()
  if (route === 'study') return renderStudyHub()
  if (route === 'quiz') return renderQuizHub()
  if (route === 'menu') return renderMenu()

  // 기존 상세 라우트(하위 화면)
  if (route === 'study-hira') return renderKanaStudy('hira')
  if (route === 'study-kata') return renderKanaStudy('kata')
  if (route === 'study-verb') return renderVerbStudy()

  if (route === 'quiz-hira') return renderKanaQuiz('hira')
  if (route === 'quiz-kata') return renderKanaQuiz('kata')
  if (route === 'quiz-verb') return renderVerbQuiz()

  if (route === 'wrong') return renderWrong()

  return renderHome()
}

render()
