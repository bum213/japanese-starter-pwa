import './style.css'

document.querySelector('#app').innerHTML = `
  <div style="max-width:400px;margin:40px auto;font-family:sans-serif;">
    <h1>💊 약 복용 체크</h1>

    <input id="pillName" type="text" placeholder="약 이름 입력"
      style="width:100%;padding:10px;margin-bottom:10px;font-size:16px;" />

    <button id="addBtn"
      style="width:100%;padding:10px;font-size:16px;">
      약 추가
    </button>

    <ul id="pillList" style="margin-top:20px;"></ul>
  </div>
`

const addBtn = document.getElementById('addBtn')
const pillInput = document.getElementById('pillName')
const pillList = document.getElementById('pillList')

let pills = []

addBtn.addEventListener('click', () => {
  const name = pillInput.value.trim()
  if (!name) return

  pills.push({ name, taken: false })
  pillInput.value = ''
  render()
})

function render() {
  pillList.innerHTML = ''
  pills.forEach((pill, index) => {
    const li = document.createElement('li')
    li.style.marginBottom = '10px'
    li.innerHTML = `
      <span>${pill.name}</span>
      <button style="margin-left:10px;">
        ${pill.taken ? '✔ 복용완료' : '복용하기'}
      </button>
    `
    li.querySelector('button').addEventListener('click', () => {
      pill.taken = !pill.taken
      render()
    })
    pillList.appendChild(li)
  })
}