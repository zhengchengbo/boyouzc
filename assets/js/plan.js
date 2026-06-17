// ========================================
// 博友政策 · 自助申报规划 JS
// 含DOCX生成 + 下载功能
// ========================================

// docx 库来自全局加载
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, WidthType, BorderStyle, LevelFormat, NumberFormat, convertInchesToPoint } = docx;

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
            const loadingHtml = '<div class="result-loading">' +
                '<div class="loading-spinner"></div>' +
                '<h3>正在为您生成专属申报规划书...</h3>' +
                '<p>分析企业数据 · 匹配政策资源 · 制定最优方案</p>' +
                '</div>';
            resultDiv.innerHTML = loadingHtml;
            
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
        if (c.name in data) {
            if (!Array.isArray(data[c.name])) data[c.name] = [];
            data[c.name].push(c.value);
        } else {
            if (c.name === 'qualifications') data.qualifications.push(c.value);
            if (c.name === 'interests') data.interests.push(c.value);
        }
    });
    
    // 转换显示的文本
    data.companyName = form.querySelector('[name="companyName"]').value.trim();
    data.contactName = form.querySelector('[name="contactName"]').value.trim();
    data.contactPhone = form.querySelector('[name="contactPhone"]').value.trim();
    
    var industryMap = {'信息技术':'信息技术','生物医药':'生物医药','新材料':'新材料','高端装备':'高端装备制造','新能源':'新能源/节能环保','人工智能':'人工智能','电子信息':'电子信息','制造业':'传统制造业','建筑业':'建筑业','农业':'现代农业','文化创意':'文化创意','其他':'其他'};
    data.industryText = industryMap[data.industry] || data.industry;
    
    var yearMap = {'2025':'成立不到1年','2024':'成立约1-2年','2023':'成立约2-3年','2022':'成立约3-4年','2021':'成立约4-5年','2020-2016':'成立5-10年','2015-before':'成立10年以上'};
    data.establishText = yearMap[data.establishYear] || data.establishYear;
    
    var districtMap = {'福田区':'福田区','罗湖区':'罗湖区','南山区':'南山区','宝安区':'宝安区','龙岗区':'龙岗区','龙华区':'龙华区','光明区':'光明区','坪山区':'坪山区','盐田区':'盐田区','大鹏新区':'大鹏新区','深汕合作区':'深汕合作区','广东省其他市':'广东省其他市','其他省市':'其他省市'};
    data.districtText = districtMap[data.district] || data.district;
    
    var revenueMap = {'0-500':'500万以下','500-1000':'500万-1000万','1000-2000':'1000万-2000万','2000-5000':'2000万-5000万','5000-10000':'5000万-1亿','10000-20000':'1亿-2亿','20000-50000':'2亿-5亿','50000+':'5亿以上'};
    data.revenueText = revenueMap[data.revenue] || data.revenue;
    
    var empMap = {'0-5':'5人及以下','5-10':'6-10人','10-20':'10-20人','20-50':'20-50人','50-100':'50-100人','100-200':'100-200人','200-500':'200-500人','500+':'500人以上'};
    data.employeesText = empMap[data.employees] || data.employees;
    
    return data;
}

// 显示结果并生成docx
function showResult(data) {
    const matches = generateMatches(data);
    const resultDiv = document.getElementById('planResult');
    
    // 生成docx
    generateDocx(data, matches);
    
    // 展示结果页
    let html = '<div class="result-content">';
    html += '<div class="result-header">';
    html += '<span class="result-icon">🎉</span>';
    html += '<h2>您的专属申报规划书已生成</h2>';
    html += '<p>以下是根据您的企业信息匹配的深圳2026年补贴项目</p>';
    html += '</div>';
    
    // 下载按钮
    html += '<div class="result-download-bar">';
    html += '<button class="btn btn-primary btn-lg" onclick="downloadDocx()">📥 下载申报规划书（Word文档）</button>';
    html += '<p class="download-note">.docx格式，可直接用Word/WPS打开编辑</p>';
    html += '</div>';
    
    // 申报时间线
    html += '<div class="result-section">';
    html += '<h3>📅 推荐申报时间线</h3>';
    html += '<div class="timeline">';
    
    matches.forEach(function(m) {
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
    
    // 滚动到结果区
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ========================================
// DOCX生成
// ========================================

var _docxBlob = null; // 缓存生成的docx

async function generateDocx(data, matches) {
    try {
        const now = new Date();
        const dateStr = now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日';
        
        // 企业信息表格数据
        const infoRows = [
            ['企业名称', data.companyName || '—'],
            ['所属行业', data.industryText || '—'],
            ['成立时间', data.establishText || '—'],
            ['注册地区', data.districtText || '—'],
            ['上年度营收', data.revenueText || '—'],
            ['员工人数', data.employeesText || '—'],
            ['联系电话', data.contactPhone || '—'],
            ['联系人', data.contactName || '—']
        ];
        
        // 构建文档段落
        const children = [];
        
        // === 封面/标题 ===
        children.push(new Paragraph({
            spacing: { before: 600, after: 200 },
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: '企业政策申报规划书', bold: true, size: 44, font: 'SimHei', color: '1a3a5c' })
            ]
        }));
        
        children.push(new Paragraph({
            spacing: { before: 100, after: 100 },
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: '深圳市博友项目科技有限公司', size: 24, font: 'SimSun', color: '666666' })
            ]
        }));
        
        children.push(new Paragraph({
            spacing: { before: 100, after: 400 },
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: '生成日期：' + dateStr, size: 22, font: 'SimSun', color: '666666' })
            ]
        }));
        
        // 分隔线
        children.push(new Paragraph({
            spacing: { before: 0, after: 400 },
            border: { bottom: { size: 6, color: 'c9a84c', style: BorderStyle.SINGLE, space: 1 } },
            children: []
        }));
        
        // === 一、企业基本信息 ===
        children.push(new Paragraph({
            spacing: { before: 400, after: 200 },
            children: [
                new TextRun({ text: '一、企业基本信息', bold: true, size: 28, font: 'SimHei', color: '1a3a5c' })
            ]
        }));
        
        // 信息表格
        const tableRows = infoRows.map(function(row) {
            return new TableRow({
                children: [
                    new TableCell({
                        width: { size: 2000, type: WidthType.DXA },
                        children: [new Paragraph({
                            spacing: { before: 60, after: 60 },
                            alignment: AlignmentType.CENTER,
                            children: [new TextRun({ text: row[0], bold: true, size: 21, font: 'SimSun' })]
                        })]
                    }),
                    new TableCell({
                        width: { size: 6000, type: WidthType.DXA },
                        children: [new Paragraph({
                            spacing: { before: 60, after: 60 },
                            children: [new TextRun({ text: row[1], size: 21, font: 'SimSun' })]
                        })]
                    })
                ]
            });
        });
        
        const infoTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows
        });
        children.push(infoTable);
        children.push(new Paragraph({ spacing: { before: 200, after: 200 }, children: [] }));
        
        // === 二、匹配结果摘要 ===
        children.push(new Paragraph({
            spacing: { before: 400, after: 200 },
            children: [
                new TextRun({ text: '二、政策匹配结果', bold: true, size: 28, font: 'SimHei', color: '1a3a5c' })
            ]
        }));
        
        children.push(new Paragraph({
            spacing: { before: 100, after: 200 },
            children: [
                new TextRun({ text: '经系统分析贵企业的基本情况，以下为推荐的申报项目（按优先级排序）：', size: 22, font: 'SimSun' })
            ]
        }));
        
        // 匹配结果表格
        const matchHeaderRow = new TableRow({
            tableHeader: true,
            children: [
                new TableCell({
                    width: { size: 800, type: WidthType.DXA },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '序号', bold: true, size: 20, font: 'SimHei', color: 'FFFFFF' })] })]
                }),
                new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '推荐项目', bold: true, size: 20, font: 'SimHei', color: 'FFFFFF' })] })]
                }),
                new TableCell({
                    width: { size: 2200, type: WidthType.DXA },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '预估补贴', bold: true, size: 20, font: 'SimHei', color: 'FFFFFF' })] })]
                }),
                new TableCell({
                    width: { size: 2000, type: WidthType.DXA },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '申报窗口', bold: true, size: 20, font: 'SimHei', color: 'FFFFFF' })] })]
                })
            ]
        });
        
        const matchDataRows = matches.map(function(m, idx) {
            return new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(idx + 1), size: 20, font: 'SimSun' })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: m.name, size: 20, font: 'SimSun' })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: m.amount, size: 20, font: 'SimSun' })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: m.window, size: 20, font: 'SimSun' })] })] })
                ]
            });
        });
        
        const matchTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [matchHeaderRow].concat(matchDataRows)
        });
        children.push(matchTable);
        children.push(new Paragraph({ spacing: { before: 200, after: 200 }, children: [] }));
        
        // === 三、详细规划 ===
        children.push(new Paragraph({
            spacing: { before: 400, after: 200 },
            children: [
                new TextRun({ text: '三、详细申报规划', bold: true, size: 28, font: 'SimHei', color: '1a3a5c' })
            ]
        }));
        
        matches.forEach(function(m, idx) {
            children.push(new Paragraph({
                spacing: { before: 200, after: 100 },
                children: [
                    new TextRun({ text: (idx + 1) + '. ' + m.name, bold: true, size: 24, font: 'SimHei', color: '1a3a5c' })
                ]
            }));
            
            children.push(new Paragraph({
                spacing: { before: 60, after: 60 },
                indent: { left: 400 },
                children: [
                    new TextRun({ text: '预估补贴：', bold: true, size: 22, font: 'SimSun' }),
                    new TextRun({ text: m.amount, size: 22, font: 'SimSun' })
                ]
            }));
            
            children.push(new Paragraph({
                spacing: { before: 60, after: 60 },
                indent: { left: 400 },
                children: [
                    new TextRun({ text: '申报窗口：', bold: true, size: 22, font: 'SimSun' }),
                    new TextRun({ text: m.window, size: 22, font: 'SimSun' })
                ]
            }));
            
            children.push(new Paragraph({
                spacing: { before: 60, after: 200 },
                indent: { left: 400 },
                children: [
                    new TextRun({ text: '项目说明：', bold: true, size: 22, font: 'SimSun' }),
                    new TextRun({ text: m.desc, size: 22, font: 'SimSun' })
                ]
            }));
        });
        
        // === 四、温馨提示 ===
        children.push(new Paragraph({
            spacing: { before: 400, after: 200 },
            children: [
                new TextRun({ text: '四、温馨提示', bold: true, size: 28, font: 'SimHei', color: '1a3a5c' })
            ]
        }));
        
        const tips = [
            '本规划书由系统自动生成，仅供参考。各项目最终申报条件以当年政府正式发布的通知为准。',
            '建议您联系博友政策获取免费的专业诊断，13年经验的资深顾问将为您做一对一的政策匹配分析。',
            '部分项目需要提前准备材料（如知识产权申请周期6-18个月），建议尽早规划。',
            '各区奖励政策每年可能微调，请以申报时发布的最新政策文件为准。'
        ];
        
        tips.forEach(function(tip) {
            children.push(new Paragraph({
                spacing: { before: 60, after: 60 },
                indent: { left: 400 },
                children: [
                    new TextRun({ text: '• ', size: 22, font: 'SimSun' }),
                    new TextRun({ text: tip, size: 22, font: 'SimSun' })
                ]
            }));
        });
        
        // === 页脚信息 ===
        children.push(new Paragraph({
            spacing: { before: 600, after: 100 },
            border: { top: { size: 6, color: 'c9a84c', style: BorderStyle.SINGLE, space: 1 } },
            children: []
        }));
        
        children.push(new Paragraph({
            spacing: { before: 200 },
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: '深圳市博友项目科技有限公司', size: 20, font: 'SimSun', color: '999999' })
            ]
        }));
        
        children.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: '电话：135-9045-7677 | 网站：boyouzc.com', size: 20, font: 'SimSun', color: '999999' })
            ]
        }));
        
        children.push(new Paragraph({
            spacing: { after: 200 },
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: '地址：深圳市龙岗区碧新路2380号新生绿谷3栋1701', size: 20, font: 'SimSun', color: '999999' })
            ]
        }));
        
        // 构建文档
        const doc = new Document({
            styles: {
                default: {
                    document: {
                        run: { font: 'SimSun', size: 22 }
                    }
                }
            },
            sections: [{
                properties: {
                    page: {
                        margin: { top: convertInchesToPoint(1), right: convertInchesToPoint(1), bottom: convertInchesToPoint(1), left: convertInchesToPoint(1.2) }
                    }
                },
                children: children
            }]
        });
        
        // 生成Blob
        const blob = await Packer.toBlob(doc);
        _docxBlob = blob;
        
        // 更新页面显示（已生成完成）
        console.log('DOCX generated:', blob.size, 'bytes');
        
    } catch (e) {
        console.error('DOCX生成失败:', e);
        // 即使docx生成失败，页面结果已经展示，不影响用户体验
    }
}

// 下载docx
function downloadDocx() {
    if (!_docxBlob) {
        alert('申报规划书正在生成中，请稍候...');
        return;
    }
    
    const now = new Date();
    const fileName = '博友政策_申报规划书_' + now.getFullYear() + 
        String(now.getMonth() + 1).padStart(2, '0') + 
        String(now.getDate()).padStart(2, '0') + '.docx';
    
    saveAs(_docxBlob, fileName);
}

// ========================================
// 匹配逻辑
// ========================================

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
    
    var yearsOld = 0;
    if (establishYear === '2025') yearsOld = 0;
    else if (establishYear === '2024') yearsOld = 2;
    else if (establishYear === '2023') yearsOld = 3;
    else if (establishYear === '2022') yearsOld = 4;
    else if (establishYear === '2021') yearsOld = 5;
    else if (establishYear === '2020-2016') yearsOld = 8;
    else yearsOld = 12;
    
    if (yearsOld >= 0 && !hasQual('gaoxin')) {
        matches.push({
            name: '科技型中小企业评价入库',
            amount: '基础资质（申报其他项目的前提）',
            window: '6月1日 — 8月31日 ⚡进行中',
            urgency: 'now',
            desc: '门槛最低的资质，职工≤500人、营收≤2亿即可申报。也是国高认定的前置条件之一。'
        });
    }
    
    if (yearsOld >= 1 && !hasQual('gaoxin') && revenue !== '0-500') {
        matches.push({
            name: '国家高新技术企业认定',
            amount: '20-35万（各区不同）',
            window: '每年3-5月（建议提前6个月准备）',
            urgency: 'soon',
            desc: '深圳企业补贴的"入场券"。拿下国高后续申报事半功倍。企业所得税由25%降至15%。'
        });
    }
    
    if (yearsOld >= 2 && (isRevenueOK(1000) || (interests || []).indexOf('zhuanjing') >= 0)) {
        matches.push({
            name: '专精特新企业认定',
            amount: '省专精特新20-50万 · 国家小巨人50-200万',
            window: '每年7-10月',
            urgency: 'soon',
            desc: '中小企业申报的主战场，2026年认定标准优化，现在是最佳窗口期。'
        });
    }
    
    if (data.rdCost && data.rdCost !== '0-50') {
        matches.push({
            name: '企业研发费用资助',
            amount: '按研发投入一定比例资助',
            window: '6月10日 — 7月9日 ⚡进行中',
            urgency: 'now',
            desc: '有实际研发投入的企业均可申报，按比例补助。'
        });
    }
    
    if ((interests || []).indexOf('jigai') >= 0) {
        matches.push({
            name: '技术改造项目',
            amount: '最高5000万',
            window: '以当年通知为准（建议提前备案设备投资）',
            urgency: 'later',
            desc: '深圳金额最大的普惠性补贴之一。有实际设备投资的企业大概率能拿到。'
        });
    }
    
    if ((interests || []).indexOf('rencai') >= 0) {
        matches.push({
            name: '高层次人才补贴',
            amount: '160-600万',
            window: '常年受理',
            urgency: 'later',
            desc: '企业有博士学历或核心研发人员即可申报，很多企业不知道自己技术负责人符合条件。'
        });
    }
    
    if (isRevenueOK(5000) && (interests || []).indexOf('gongcheng') >= 0) {
        matches.push({
            name: '工程研究中心/工程实验室',
            amount: '500-1500万',
            window: '以当年通知为准',
            urgency: 'later',
            desc: '含金量最高的门槛之一，拿下意味着行业技术地位得到政府背书。'
        });
    }
    
    if ((interests || []).indexOf('junxun') >= 0) {
        matches.push({
            name: '军工资质办理',
            amount: '市场准入资质',
            window: '常年受理',
            urgency: 'later',
            desc: '4项军工资质全流程服务，适合有意进入军工供应链的企业。'
        });
    }
    
    if (district !== '其他省市' && (interests || []).indexOf('gaoxin') >= 0) {
        matches.push({
            name: '人工智能语料券',
            amount: '采购补贴最高200万，开放奖励最高100万',
            window: '9月1日 — 11月10日',
            urgency: 'soon',
            desc: '2026年新项目，有AI语料采购需求的企业可申报。首批12家企业已获730万+。'
        });
    }
    
    if (matches.length === 0) {
        matches.push({
            name: '免费专业诊断',
            amount: '联系博友政策获取1对1诊断',
            window: '随时预约',
            urgency: 'now',
            desc: '根据您提供的信息，系统暂时无法精准匹配。建议直接联系我们，13年经验的老顾问为您免费做一次全面的企业诊断。'
        });
    }
    
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