// 전역 변수 설정
let lipsticks = [];
let myChart = null;
let scatterChart = null; // 산점도 차트 변수 추가
const colorThief = new ColorThief();

// --- HTML 로딩 후 실행 ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadData();

    // 1. 이미지 및 색상 추출
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        const imagePreview = document.getElementById('imagePreview');
        imageInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (event) {
                if (imagePreview) {
                    imagePreview.src = event.target.result;
                    imagePreview.classList.remove('hidden');
                }
                const img = new Image();
                img.src = event.target.result;
                img.onload = function () {
                    try {
                        const color = colorThief.getColor(img);
                        const hex = rgbToHex(color[0], color[1], color[2]);
                        const inputHex = document.getElementById('inputHex');
                        if (inputHex) inputHex.value = hex;
                        
                        const suggestedTone = suggestTone(color[0], color[1], color[2]);
                        const selectBox = document.getElementById('inputPersonalColor');
                        if (selectBox) {
                            selectBox.value = suggestedTone;
                            selectBox.classList.add('bg-rose-100');
                            setTimeout(() => selectBox.classList.remove('bg-rose-100'), 1000);
                        }
                    } catch (err) {}
                };
            };
            reader.readAsDataURL(file);
        });
    }

    // 2. 등록
    const addBtn = document.getElementById('addBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const brand = document.getElementById('inputBrand')?.value;
            const name = document.getElementById('inputName')?.value;
            const colorName = document.getElementById('inputColorName')?.value;
            const pColor = document.getElementById('inputPersonalColor')?.value;
            const hex = document.getElementById('inputHex')?.value;

            if (!brand && !name) { alert('정보를 입력해주세요!'); return; }
            if (!pColor) { alert('퍼스널 컬러를 선택해주세요!'); return; }

            const newItem = {
                id: Date.now(),
                brand: brand || '', name: name || '', colorNum: colorName || '',
                personalColor: pColor, colorCode: hex || '#000000',
                date: new Date().toISOString()
            };
            lipsticks.push(newItem);
            saveData();
            render();
            updateAnalysis(); // 막대 그래프 업데이트
            updateScatterChart(); // ✨ 사분면 차트 업데이트
            
            // 초기화
            document.getElementById('inputBrand').value = '';
            document.getElementById('inputName').value = '';
            document.getElementById('inputColorName').value = '';
        });
    }

    // 3. 샘플 / 4. 초기화 / 5. 다운로드 / 6. 업로드 (기존 코드 유지하되 함수 호출 추가)
    // (지면 관계상 핵심 로직만 변경합니다. 기존 이벤트 리스너 안에 updateScatterChart()만 추가하면 됩니다.)
    
    // 샘플 버튼 예시
    const sampleBtn = document.getElementById('sampleBtn');
    if (sampleBtn) {
        sampleBtn.addEventListener('click', () => {
             const samples = [
                { id: Date.now() + 1, brand: '롬앤', name: '쥬시래스팅', colorNum: '피그베리', personalColor: '여름 쿨 뮤트', colorCode: '#C85A65' },
                { id: Date.now() + 2, brand: '페리페라', name: '잉크무드', colorNum: '갓기천사', personalColor: '여름 쿨 브라이트', colorCode: '#FE59C2' },
                { id: Date.now() + 3, brand: '3CE', name: '벨벳 립 틴트', colorNum: '다포딜', personalColor: '가을 웜 딥', colorCode: '#B25049' },
                { id: Date.now() + 4, brand: '입생로랑', name: '더 슬림', colorNum: '1966', personalColor: '가을 웜 다크', colorCode: '#4B3621' },
                { id: Date.now() + 5, brand: '샤넬', name: '루쥬 알뤼르', colorNum: '99호', personalColor: '겨울 쿨 다크', colorCode: '#3E0015' },
                { id: Date.now() + 6, brand: '라카', name: '프루티글램', colorNum: '103 험밍', colorCode: '#FFDAC1', personalColor: '봄 웜 라이트' }
            ];
            lipsticks = [...lipsticks, ...samples];
            saveData();
            render();
            updateAnalysis();
            updateScatterChart(); // 추가
            alert('샘플 추가됨!');
        });
    }
    
    // 초기화 버튼
    const resetBtn = document.getElementById('resetBtn');
    if(resetBtn) {
        resetBtn.addEventListener('click', ()=>{
             if(confirm('삭제?')) { lipsticks=[]; saveData(); render(); updateAnalysis(); updateScatterChart(); }
        });
    }
    
    // CSV 업로드 리스너 내부에도 updateScatterChart() 추가 필요
    const csvUpload = document.getElementById('csvUpload');
    if (csvUpload) {
        csvUpload.addEventListener('change', (e) => {
            // ... (기존 파일 읽기 로직) ...
            // reader.onload 내부 마지막에:
            // saveData(); render(); updateAnalysis(); updateScatterChart(); 
        });
    }

});

// --- 헬퍼 함수들 ---
function loadData() {
    const saved = localStorage.getItem('lipstickCollection_v3');
    if (saved) lipsticks = JSON.parse(saved);
    render();
    updateAnalysis();
    updateScatterChart(); // 로드 시 실행
}

function saveData() { localStorage.setItem('lipstickCollection_v3', JSON.stringify(lipsticks)); updateHeaderCount(); }
function updateHeaderCount() { const el = document.getElementById('headerTotalCount'); if(el) el.textContent = lipsticks.length; }
function rgbToHex(r, g, b) { return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1); }
function suggestTone(r,g,b) { /* 기존 로직 유지 */ 
    // ... (이전 답변의 suggestTone 함수 코드 그대로 사용) ...
    let rabs = r / 255, gabs = g / 255, babs = b / 255;
    let max = Math.max(rabs, gabs, babs), min = Math.min(rabs, gabs, babs);
    let v = max, s = max==0?0:(max-min)/max;
    const isCool = b > r * 0.8 || (r > g && b > g * 0.9);
    
    if (!isCool) {
        if (v > 0.7 && s < 0.6) return '봄 웜 라이트';
        if (v > 0.6 && s >= 0.6) return '봄 웜 브라이트';
        if (v <= 0.6 && s < 0.6) return '가을 웜 뮤트';
        if (v <= 0.3) return '가을 웜 다크';
        return '가을 웜 딥';
    } else {
        if (v > 0.7) return s >= 0.5 ? '여름 쿨 브라이트' : '여름 쿨 라이트';
        if (v > 0.5 && s < 0.7) return '여름 쿨 뮤트';
        if (v <= 0.3) return '겨울 쿨 다크';
        return s >= 0.7 ? '겨울 쿨 브라이트' : '겨울 쿨 딥';
    }
}

// 기존 막대 그래프 (유지)
function updateAnalysis() {
    // ... (이전 답변의 updateAnalysis 코드 그대로 사용) ...
     const section = document.getElementById('analysisSection');
    if (!section) return;
    const validData = lipsticks.filter(l => l.personalColor !== '잘 모름');
    if (validData.length === 0) { section.classList.add('hidden'); return; }
    section.classList.remove('hidden');

    const counts = {
        '봄 웜 라이트': 0, '봄 웜 브라이트': 0,
        '여름 쿨 라이트': 0, '여름 쿨 브라이트': 0, '여름 쿨 뮤트': 0,
        '가을 웜 뮤트': 0, '가을 웜 딥': 0, '가을 웜 다크': 0,
        '겨울 쿨 브라이트': 0, '겨울 쿨 딥': 0, '겨울 쿨 다크': 0 
    };
    validData.forEach(lip => { if (counts[lip.personalColor] !== undefined) counts[lip.personalColor]++; });

    const canvas = document.getElementById('personalColorChart');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (myChart) myChart.destroy();
        const toneColors = ['#e56b68', '#fa361c', '#f0a9b1', '#e55c9d', '#c0595a', '#c96f6f', '#b65e61', '#4d313d', '#D31C43', '#852438', '#4c1d30'];
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['봄라', '봄브', '여라', '여브', '여뮤', '갈뮤', '갈딥', '갈닼', '겨브', '겨딥', '겨닼'],
                datasets: [{ data: Object.values(counts), backgroundColor: toneColors, borderRadius: 50, barThickness: 10 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: {font:{size:9}} }, y: { display: false, grid: { display: false } } } }
        });
    }
    // 멘트 업데이트 로직은 그대로 둠
     const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const max = sorted[0];

    let text = `<div class="flex flex-col items-center justify-center text-center">
        <span class="text-sm text-gray-400 mb-1">가장 많은 퍼스널 컬러는?</span>
        <div class="text-xl text-rose-600 font-bold flex items-center gap-2">
            ✨ ${max[0]} <span class="bg-rose-100 text-rose-600 text-xs px-2 py-1 rounded-full">${max[1]}개</span>
        </div>
    </div>`;
    const analysisText = document.getElementById('analysisText');
    if (analysisText) analysisText.innerHTML = text;
}

// ✨ NEW: 사분면 산점도 차트 (좌표 매핑)
function updateScatterChart() {
    const canvas = document.getElementById('scatterChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (scatterChart) scatterChart.destroy();

    // 1. 퍼스널 컬러를 좌표(X, Y)로 변환
    // X축: Warm(음수) <-> Cool(양수)
    // Y축: Deep(음수) <-> Light(양수)
    // 겹침 방지를 위해 랜덤값(jitter) 추가
    const mapToneToCoords = (tone) => {
        const jitter = () => (Math.random() - 0.5) * 1.5; // 약간의 랜덤 분산
        switch(tone) {
            case '봄 웜 라이트':    return { x: -4 + jitter(), y: 6 + jitter() };
            case '봄 웜 브라이트':  return { x: -2 + jitter(), y: 3 + jitter() };
            case '여름 쿨 라이트':  return { x: 4 + jitter(), y: 6 + jitter() };
            case '여름 쿨 브라이트':return { x: 2 + jitter(), y: 3 + jitter() };
            case '여름 쿨 뮤트':    return { x: 1 + jitter(), y: 0 + jitter() };
            case '가을 웜 뮤트':    return { x: -1 + jitter(), y: 0 + jitter() };
            case '가을 웜 딥':      return { x: -4 + jitter(), y: -4 + jitter() };
            case '가을 웜 다크':    return { x: -6 + jitter(), y: -7 + jitter() };
            case '겨울 쿨 브라이트':return { x: 2 + jitter(), y: -2 + jitter() };
            case '겨울 쿨 딥':      return { x: 4 + jitter(), y: -5 + jitter() };
            case '겨울 쿨 다크':    return { x: 6 + jitter(), y: -7 + jitter() };
            default: return null;
        }
    };

    const scatterData = lipsticks
        .filter(l => l.personalColor !== '잘 모름')
        .map(l => {
            const coords = mapToneToCoords(l.personalColor);
            return {
                x: coords.x,
                y: coords.y,
                brand: l.brand,
                name: l.name,
                colorCode: l.colorCode // 실제 립스틱 색상을 점 색깔로!
            };
        });

    scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Lipsticks',
                data: scatterData,
                pointBackgroundColor: (context) => context.raw?.colorCode || '#000', // 점 색상 = 립스틱 색상
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 8, // 점 크기 키움
                pointHoverRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const data = context.raw;
                            return `${data.brand} ${data.name}`; // 툴팁에 이름 표시
                        }
                    }
                }
            },
            scales: {
                x: { 
                    min: -10, max: 10, 
                    grid: { color: '#f0f0f0' }, 
                    ticks: { display: false } // 눈금 숫자 숨김
                },
                y: { 
                    min: -10, max: 10, 
                    grid: { color: '#f0f0f0' }, 
                    ticks: { display: false } 
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

function render(filter='all') {
     const grid = document.getElementById('lipstickGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const filtered = lipsticks.filter(lip => {
        if (filter === 'all') return true;
        return lip.personalColor.includes(filter);
    });
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400 text-sm">해당하는 립이 없어요 😢</div>';
        return;
    }
    filtered.forEach(lip => {
        const html = `
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex gap-3 items-center relative fade-in group">
            <div class="w-10 h-10 rounded-full color-swatch flex-none shadow-inner" style="background-color: ${lip.colorCode}"></div>
            <div class="flex-1 min-w-0">
                <div class="text-[10px] text-stone-400 font-bold mb-0.5">${lip.brand}</div>
                <div class="font-bold text-stone-700 text-sm truncate">${lip.name}</div>
                <div class="flex items-center gap-2 mt-1">
                    <span class="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-500 truncate max-w-[80px]">${lip.personalColor}</span>
                </div>
            </div>
            <button onclick="deleteItem(${lip.id})" class="text-stone-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </div>`;
        grid.insertAdjacentHTML('beforeend', html);
    });
    lucide.createIcons();
}
// deleteItem, filterBy 등은 그대로 유지
