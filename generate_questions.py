import csv
import json

questions_map = {}
categories = {}

with open('data.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        q_no = row['Question No.']
        pillar = row['Pillar']
        weight = row['Weightage']
        q_text = row['Questionnaire']
        option_text = row['Response Option']
        score_text = row['Response Score (0-4)']
        na = row['N/A / Applicability']
        risk_level = row.get('Risk Level', '')
        risk_trigger = row.get('Risk Trigger', '')
        verification = row.get('Verification Required', '')
        action = row.get('Recommended Corrective Action', '')
        
        if not pillar:
            continue
            
        if pillar not in categories and "Diagnostic" not in pillar:
            try:
                categories[pillar] = float(weight) / 100.0 if weight else 0.1
            except ValueError:
                categories[pillar] = 0.1
        
        if q_no not in questions_map:
            try:
                slNo = int(q_no.replace('Q', ''))
            except:
                slNo = 0
            
            is_diag = 'Diagnostic' in pillar
            questions_map[q_no] = {
                'id': slNo,
                'qNo': q_no,
                'slNo': slNo,
                'category': pillar,
                'weightage': float(weight) if weight and not is_diag else 0,
                'text': q_text,
                'type': 'Diagnostic' if is_diag else 'Normal',
                'options': []
            }
            
        # Parse score
        score_val = "NA"
        if score_text and score_text != "Not scored":
            try:
                score_val = int(score_text)
            except:
                score_val = score_text
        elif na == 'Yes' or option_text.lower() == 'not applicable':
            score_val = "NA"
        
        if option_text:
            questions_map[q_no]['options'].append({
                'label': option_text,
                'score': score_val,
                'riskLevel': risk_level,
                'riskTrigger': risk_trigger,
                'verificationRequired': (verification == 'Yes'),
                'correctiveAction': action
            })

# Convert to list
questions_list = list(questions_map.values())
questions_list.sort(key=lambda x: x['slNo'])

# Generate JS
js_content = "export const QUESTIONS = " + json.dumps(questions_list, indent=2) + ";\n\n"
js_content += "export const MANDATORY_IDS = [];\n\n"

# Category array
colors = [
    "from-blue-500 to-blue-600",
    "from-indigo-500 to-indigo-600",
    "from-violet-500 to-violet-600",
    "from-cyan-500 to-cyan-600",
    "from-teal-500 to-teal-600",
    "from-sky-500 to-sky-600",
    "from-fuchsia-500 to-fuchsia-600",
    "from-emerald-500 to-emerald-600",
    "from-pink-500 to-pink-600"
]

badges = [
    "bg-blue-100 text-blue-700 border-blue-200",
    "bg-indigo-100 text-indigo-700 border-indigo-200",
    "bg-violet-100 text-violet-700 border-violet-200",
    "bg-cyan-100 text-cyan-700 border-cyan-200",
    "bg-teal-100 text-teal-700 border-teal-200",
    "bg-sky-100 text-sky-700 border-sky-200",
    "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
    "bg-emerald-100 text-emerald-700 border-emerald-200",
    "bg-pink-100 text-pink-700 border-pink-200"
]

cat_str = "export const CATEGORIES = [\n"
i = 0
for cat, weight in categories.items():
    count = sum(1 for q in questions_list if q['category'] == cat)
    c = colors[i % len(colors)]
    b = badges[i % len(badges)]
    cat_str += f'  {{ name: "{cat}", color: "{c}", count: {count}, badge: "{b}", weight: {weight} }},\n'
    i += 1
cat_str += "];\n\n"

js_content += cat_str

js_content += """export const CHART_COLORS = ['#0047AB', '#00AEEF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#a855f7', '#10b981'];

export function getScore(question, answerLabel) {
  if (!question || !question.options) return 0;
  const opt = question.options.find(o => o.label === answerLabel);
  if (!opt) return 0;
  return opt.score;
}

export function getRatingCategory(percentage) {
  if (percentage >= 80) {
    return {
      label: "Partnership Ready",
      description: "Meets high standard of readiness across all key governance and operational dimensions.",
      color: "green",
    };
  } else if (percentage >= 65) {
    return {
      label: "Partnership Ready with Targeted Improvements",
      description: "Strong overall posture with specific areas needing refinement.",
      color: "emerald",
    };
  } else if (percentage >= 50) {
    return {
      label: "Conditional / Capacity Strengthening Required",
      description: "Moderate readiness; needs structured capacity building prior to major institutional funding.",
      color: "amber",
    };
  }
  return {
    label: "Significant Readiness Gaps",
    description: "Substantial institutional and statutory gaps requiring fundamental restructuring.",
    color: "red",
  };
}

export function calculateResults(answers) {
  const answerList = Array.isArray(answers) ? answers : Object.values(answers || {});
  
  const categoryMap = {};
  CATEGORIES.forEach(cat => {
    categoryMap[cat.name] = {
      name: cat.name,
      scored: 0,
      max: 0,
      percentage: 0,
      weight: cat.weight,
      count: cat.count,
      answered: 0
    };
  });

  const criticalRisks = [];
  const verificationRequired = [];
  const correctiveActions = [];

  answerList.forEach(ans => {
    const q = QUESTIONS.find(item => item.id === ans.questionId);
    if (!q) return;

    const opt = q.options.find(o => o.label === ans.selectedAnswer);
    const scoreVal = opt ? opt.score : (typeof ans.score === 'number' ? ans.score : 0);

    if (categoryMap[q.category]) {
      categoryMap[q.category].answered++;
      if (scoreVal !== "NA" && typeof scoreVal === "number") {
        categoryMap[q.category].scored += scoreVal;
        categoryMap[q.category].max += 4; // 4 is max marks per question
      }
    }

    if (opt) {
      if (opt.riskLevel === "Critical Review" || opt.riskLevel === "High") {
        criticalRisks.push({ question: q.text, riskLevel: opt.riskLevel, action: opt.correctiveAction });
      }
      if (opt.verificationRequired) {
        verificationRequired.push({ question: q.text, action: opt.correctiveAction });
      }
      if (opt.correctiveAction) {
        correctiveActions.push(opt.correctiveAction);
      }
    }
  });

  let weightedScoreSum = 0;
  let activeWeightSum = 0;

  CATEGORIES.forEach(cat => {
    const cm = categoryMap[cat.name];
    if (cm.max > 0) {
      cm.percentage = Math.round((cm.scored / cm.max) * 100);
      weightedScoreSum += (cm.scored / cm.max) * cat.weight;
      activeWeightSum += cat.weight;
    } else {
      cm.percentage = 0;
    }
  });

  const finalPercentage = activeWeightSum > 0 ? Math.round((weightedScoreSum / activeWeightSum) * 100) : 0;
  const ratingInfo = getRatingCategory(finalPercentage);

  return {
    totalScore: finalPercentage,
    score: finalPercentage,
    maxScore: 100,
    percentage: finalPercentage,
    rating: ratingInfo.label,
    performanceLevel: ratingInfo.label,
    color: ratingInfo.color,
    riskLevel: finalPercentage >= 70 ? "Low Risk" : finalPercentage >= 50 ? "Medium Risk" : "High Risk",
    isEligible: criticalRisks.length === 0,
    criticalRisks,
    verificationRequired,
    correctiveActions,
    mandatoryFailed: criticalRisks.map(r => r.question),
    categoryScores: categoryMap,
  };
}
"""

with open('src/utils/questions.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
    
print("Successfully regenerated src/utils/questions.js with 57 questions and dynamic options!")
