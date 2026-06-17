// ========================================
// 博友政策 · 自助申报规划 JS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // 初始化步骤指示器
    updateIndicator(1);
    
    // 表单提交
    const form = document.getElementById('planForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 基础验证
            const name = form.querySelector('[name="contactName"]').value.trim();
            const phone = form.querySelector('[name="contactPhone"]').value.trim();
            if (!name || !phone) {
                alert('请填写姓名和联系电话');
                return;
            }
            if (!/^1\d{10}$/.test(phone)) {
                alert('请输入正确的手机号码');
                return;
            }
            
            // 显示加载动画
            form.style.display = 'none';
            document.querySelector('.step-indicator').style.display = 'none';
            const resultDiv = document.getElementById('planResult');
            resultDiv.style.display = 'block';
            
            // 收集数据
            const data = collectFormData(form);
            
            // 模拟生成过程（实际应用中可以调后端API）
            setTimeout(function() {
                showResult(data);
            }, 2500);
        });
    }
});

// 收集表单数据
function collectFormData(form) {
    const data = {};
    const fields = form.querySelectorAll('input:not([type="checkbox"]), select, textarea');
    fields.forEach(function(f) {
        data[f.name] = f.value;
    });
    
    // 复选框
    data.qualifications = [];
    data.interests = [];
    form.querySelectorAll('input[type="checkbox"]:checked').forEach(function(c) {
        if (c.name === 'qualifications') data.qualifications.push(c.value);
        if (c.name === 'interests') data.interests.push(c.value);
    });
    
    return data;
}

// 显示结果
function showResult(data) {
    const resultDiv = document.getElementById('planResult');
    
    // 根据数据生成匹配结果
    const matches = generateMatches(data);
    
    let html = '<div class="result-content">';
    html += '<div class="result-header">';
    html += '<span class="result-icon">🎉</span>';
    html += '<h2>您的专属申报规划书已生成</h2>';
    html += '<p>以下是根据您的企业信息匹配的深圳2026年补贴项目</p>';
    html += '</div>';
    
    // 理想申报时间线
    html += '<div class="result-section">';
    html += '<h3>📅 推荐申报时间线</h3>';
    html += '<div class="timeline">';
    
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    
    matches.forEach(function(m, idx) {
        var status = '';
        if (m.urgency === 'now') {
            status = '<span class="badge badge-now">正在进行</span>';
        } else if (m.urgency === 'soon') {
            status = '<span class="badge badge-soon">即将开始</span>';
        } else {
            status = '<span class="badge badge-later">可规划</span>';
        }
        
        html += '<div class="timeline-item">';
        html += '<div class="timeline-dot"></div>';
        html += '<div class="timeline-content">';
        html += '<h4>' + m.name + ' ' + status + '</h4>';
        html += '<p class="timeline-amount">💰 预估补贴：' + m.amount + '</p>';
        html += '<p class="timeline-time">⏰ 申报窗口：' + m.window + '</p>';
        html += '<p class="timeline-desc">' + m.desc + '</p>';
        html += '</div>';
        html += '</div>';
    });
    
    html += '</div>';
    html += '</div>';
    
    // CTA
    html += '<div class="result-cta">';
    html += '<h3>需要专业团队帮您申报？</h3>';
    html += '<p>免费咨询 · 全程辅导 · 让每一分政策红利都落地</p>';
    html += '<div class="result-cta-btns">';
    html += '<a href="tel:13590457677" class="btn btn-primary">📞 135-9045-7677</a>';
    html += '<a href="/contact.html" class="btn btn-outline-inverse">在线留言</a>';
    html += '</div>';
    html += '</div>';
    
    // 底部提示
    html += '<div class="result-footer">';
    html += '<p class="result-note">⚠️ 以上结果由系统自动生成，仅供参考。最终可申报项目以当年政府正式通知为准，建议联系我们做进一步免费诊断。</p>';
    html += '</div>';
    
    html += '</div>';
    
    resultDiv.innerHTML = html;
}

// 匹配逻辑 - 根据企业数据生成推荐项目
function generateMatches(data) {
    var matches = [];
    var revenue = data.revenue || '';
    var employees = data.employees || '';
    var establishYear = data.establishYear || '';
    var district = data.district || '';
    var qualifications = data.qualifications || [];
    var interests = data.interests || [];
    
    var isRevenueOK = function(min, max) {
        if (revenue === '') return false;
        var levels = {'0-500':0, '500-1000':750, '1000-2000':1500, '2000-5000':3500, '5000-10000':7500, '10000-20000':15000, '20000-50000':35000, '50000+':100000};
        var val = levels[revenue] || 0;
        return val >= (min || 0) && val <= (max || 999999);
    };
    
    var hasQual = function(q) { return qualifications.indexOf(q) >= 0; };
    var hasInterest = function(q) { return interests.indexOf(q) >= 0; };
    
    // 判断企业成立年限
    var yearsOld = 0;
    if (establishYear === '2025') yearsOld = 0;
    else if (establishYear === '2024') yearsOld = 2;
    else if (establishYear === '2023') yearsOld = 3;
    else if (establishYear === '2022') yearsOld = 4;
    else if (establishYear === '2021') yearsOld = 5;
    else if (establishYear === '2020-2016') yearsOld = 8;
    else yearsOld = 12;
    
    // 1. 科小入库 - 门槛最低
    if (yearsOld >= 0 && !hasQual('gaoxin')) {
        matches.push({
            name: '科技型中小企业评价入库',
            amount: '基础资质（申报其他项目的前提）',
            window: '6月1日 — 8月31日 ⚡进行中',
            urgency: 'now',
            desc: '门槛最低的资质，职工≤500人、营收≤2亿即可申报。也是国高认定的前置条件之一。'
        });
    }
    
    // 2. 国高认定
    if (yearsOld >= 1 && !hasQual('gaoxin') && revenue !== '0-500') {
        var amount = '20-35万（各区不同）';
        matches.push({
            name: '国家高新技术企业认定',
            amount: amount,
            window: '每年3-5月（建议提前6个月准备）',
            urgency: 'soon',
            desc: '深圳企业补贴的"入场券"。拿下国高后续申报事半功倍。'
        });
    }
    
    // 3. 专精特新
    if (yearsOld >= 2 && (isRevenueOK(1000) || interests.indexOf('zhuanjing') >= 0)) {
        matches.push({
            name: '专精特新企业认定',
            amount: '省专精特新20-50万 · 国家小巨人50-200万',
            window: '每年7-10月',
            urgency: 'soon',
            desc: '中小企业申报的主战场，2026年认定标准优化，现在是最佳窗口期。'
        });
    }
    
    // 4. 研发费用资助
    if (data.rdCost && data.rdCost !== '0-50') {
        matches.push({
            name: '企业研发费用资助',
            amount: '按研发投入一定比例资助',
            window: '6月10日 — 7月9日 ⚡进行中',
            urgency: 'now',
            desc: '有实际研发投入的企业均可申报，按比例补助。'
        });
    }
    
    // 5. 技改补贴
    if (interests.indexOf('jigai') >= 0) {
        matches.push({
            name: '技术改造项目',
            amount: '最高5000万',
            window: '以当年通知为准（建议提前备案设备投资）',
            urgency: 'later',
            desc: '深圳金额最大的普惠性补贴之一。有实际设备投资的企业大概率能拿到。'
        });
    }
    
    // 6. 人才补贴
    if (interests.indexOf('rencai') >= 0) {
        matches.push({
            name: '高层次人才补贴',
            amount: '160-600万',
            window: '常年受理',
            urgency: 'later',
            desc: '企业有博士学历或核心研发人员即可申报，很多企业不知道自己技术负责人符合条件。'
        });
    }
    
    // 7. 工程中心
    if (isRevenueOK(5000) && (interests.indexOf('gongcheng') >= 0)) {
        matches.push({
            name: '工程研究中心/工程实验室',
            amount: '500-1500万',
            window: '以当年通知为准',
            urgency: 'later',
            desc: '含金量最高的门槛之一，拿下意味着行业技术地位得到政府背书。'
        });
    }
    
    // 8. 军工资质
    if (interests.indexOf('junxun') >= 0) {
        matches.push({
            name: '军工资质办理',
            amount: '市场准入资质（无直接补贴，但打开军工市场）',
            window: '常年受理',
            urgency: 'later',
            desc: '4项军工资质全流程服务，适合有意进入军工供应链的企业。'
        });
    }
    
    // 9. 语料券
    if (district !== '其他省市' && interests.indexOf('gaoxin') >= 0) {
        matches.push({
            name: '人工智能语料券',
            amount: '采购补贴最高200万，开放奖励最高100万',
            window: '9月1日 — 11月10日',
            urgency: 'soon',
            desc: '2026年新项目，有AI语料采购需求的企业可申报。首批12家企业已获730万+。'
        });
    }
    
    // 如果没有匹配到任何项目，给一个兜底
    if (matches.length === 0) {
        matches.push({
            name: '免费专业诊断',
            amount: '联系博友政策获取1对1诊断',
            window: '随时预约',
            urgency: 'now',
            desc: '根据您提供的信息，系统暂时无法精准匹配。建议直接联系我们，13年经验的老顾问为您免费做一次全面的企业诊断。'
        });
    }
    
    // 按紧急程度排序
    var order = {now: 0, soon: 1, later: 2};
    matches.sort(function(a, b) {
        return (order[a.urgency] || 9) - (order[b.urgency] || 9);
    });
    
    return matches;
}

// 步骤切换
function nextStep(step) {
    document.querySelectorAll('.form-step').forEach(function(s) { s.style.display = 'none'; });
    var next = document.getElementById('step' + step);
    if (next) {
        next.style.display = 'block';
        next.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    updateIndicator(step);
    updateStepLine(step);
}

function prevStep(step) {
    document.querySelectorAll('.form-step').forEach(function(s) { s.style.display = 'none'; });
    var prev = document.getElementById('step' + step);
    if (prev) {
        prev.style.display = 'block';
        prev.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    updateIndicator(step);
    updateStepLine(step);
}

function updateIndicator(step) {
    for (var i = 1; i <= 3; i++) {
        var dot = document.getElementById('dot' + i);
        if (!dot) continue;
        dot.classList.remove('active', 'done');
        if (i < step) dot.classList.add('done');
        else if (i === step) dot.classList.add('active');
    }
}

function updateStepLine(active) {
    document.querySelectorAll('.step-line').forEach(function(line, idx) {
        line.classList.remove('active');
        if (idx < active - 1) line.classList.add('active');
    });
}