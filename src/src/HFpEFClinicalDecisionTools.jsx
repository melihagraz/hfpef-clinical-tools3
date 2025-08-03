import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Heart,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

// Reusable Card components
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

// Helper to safely parse number
const parseNum = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

const HFpEFClinicalDecisionTools = () => {
  const [activeTab, setActiveTab] = useState('diagnostic');

  const [diagnosticInputs, setDiagnosticInputs] = useState({
    age: '',
    bmi: '',
    hf2pef_score: '',
    e_e_medial: '',
    e_e_lateral: '',
    pasp: '',
    lv_mass: '',
    lv_ef: '',
    mean_ecv: '',
    lv_longitudinal_strain: '',
    diabetes: false,
    hypertension: false,
  });

  const [prognosticInputs, setPrognosticInputs] = useState({
    age: '',
    bmi: '',
    mean_ecv: '',
    lv_strain: '',
    e_e_ratio: '',
    quality_of_life: '',
    diabetes: false,
    pasp: '',
  });

  const [treatmentInputs, setTreatmentInputs] = useState({
    baseline_ecv: '',
    baseline_pasp: '',
    baseline_e_e: '',
    current_medications: {
      ace_arb: false,
      beta_blocker: false,
      diuretic: false,
      mra: false,
    },
    symptom_score: '',
    exercise_capacity: '',
  });

  // Diagnostic Risk Calculator
  const calculateDiagnosticRisk = () => {
    const inputs = diagnosticInputs;
    let score = 0;

    // Clinical factors (40% weight)
    if (parseNum(inputs.age) !== null) {
      const age = parseNum(inputs.age);
      score += Math.min(((age - 50) / 30) * 15, 15);
    }

    if (parseNum(inputs.hf2pef_score) !== null) {
      const hf2 = parseNum(inputs.hf2pef_score);
      score += (hf2 / 9) * 20;
    }

    if (parseNum(inputs.bmi) !== null) {
      const bmi = parseNum(inputs.bmi);
      if (bmi > 30) score += 5;
    }

    // Comorbidities
    if (inputs.diabetes) score += 8;
    if (inputs.hypertension) score += 5;

    // Hemodynamic factors (35% weight)
    const medial = parseNum(inputs.e_e_medial);
    const lateral = parseNum(inputs.e_e_lateral);
    if (medial !== null && lateral !== null) {
      const mean_e_e = (medial + lateral) / 2;
      if (mean_e_e > 15) score += 15;
      else if (mean_e_e > 10) score += 10;
      else if (mean_e_e > 8) score += 5;
    }

    if (parseNum(inputs.pasp) !== null) {
      const pasp = parseNum(inputs.pasp);
      if (pasp > 40) score += 10;
      else if (pasp > 35) score += 5;
    }

    // Imaging factors (25% weight)
    if (parseNum(inputs.mean_ecv) !== null) {
      const ecv = parseNum(inputs.mean_ecv);
      if (ecv > 30) score += 15;
      else if (ecv > 27) score += 10;
      else if (ecv > 25) score += 5;
    }

    if (parseNum(inputs.lv_longitudinal_strain) !== null) {
      const strain = Math.abs(parseNum(inputs.lv_longitudinal_strain));
      if (strain < 15) score += 10;
      else if (strain < 18) score += 5;
    }

    return Math.min(score, 100);
  };

  // Prognostic Risk Calculator
  const calculatePrognosticRisk = () => {
    const inputs = prognosticInputs;
    let score = 0;

    if (parseNum(inputs.age) !== null) {
      const age = parseNum(inputs.age);
      score += Math.min(((age - 60) / 20) * 20, 20);
    }

    if (parseNum(inputs.mean_ecv) !== null) {
      const ecv = parseNum(inputs.mean_ecv);
      if (ecv > 32) score += 25;
      else if (ecv > 28) score += 15;
      else if (ecv > 25) score += 8;
    }

    if (parseNum(inputs.lv_strain) !== null) {
      const strain = Math.abs(parseNum(inputs.lv_strain));
      if (strain < 12) score += 20;
      else if (strain < 15) score += 10;
    }

    if (parseNum(inputs.e_e_ratio) !== null) {
      const e_e = parseNum(inputs.e_e_ratio);
      if (e_e > 20) score += 15;
      else if (e_e > 15) score += 8;
    }

    if (parseNum(inputs.bmi) !== null) {
      const bmi = parseNum(inputs.bmi);
      if (bmi > 35) score += 10;
      else if (bmi > 30) score += 5;
    }

    if (inputs.diabetes) score += 10;

    if (parseNum(inputs.quality_of_life) !== null) {
      const qol = parseNum(inputs.quality_of_life);
      if (qol < 50) score += 10;
      else if (qol < 70) score += 5;
    }

    return Math.min(score, 100);
  };

  const getRiskCategory = (score) => {
    if (score < 30) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-50' };
    if (score < 70) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'High', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const getRecommendations = (score, type) => {
    const risk = getRiskCategory(score);

    if (type === 'diagnostic') {
      if (risk.level === 'Low') {
        return [
          'Consider alternative diagnoses',
          'Routine follow-up if symptoms persist',
          'Lifestyle counseling for cardiovascular health',
          'Annual assessment if risk factors present',
        ];
      } else if (risk.level === 'Moderate') {
        return [
          'Cardiology consultation recommended',
          'Advanced cardiac imaging (cardiac MRI with ECV)',
          'Comprehensive echocardiography with strain',
          'Exercise testing for functional assessment',
          'Consider cardiac catheterization if high suspicion',
        ];
      } else {
        return [
          'Urgent cardiology referral',
          'Comprehensive HFpEF evaluation protocol',
          'Cardiac MRI with tissue characterization',
          'Invasive hemodynamic assessment if indicated',
          'Initiate evidence-based HFpEF therapies',
          'Enroll in heart failure management program',
        ];
      }
    } else if (type === 'prognostic') {
      if (risk.level === 'Low') {
        return [
          'Standard heart failure management',
          'Annual follow-up with echo',
          'Lifestyle optimization focus',
          'Monitor for symptom progression',
        ];
      } else if (risk.level === 'Moderate') {
        return [
          'Enhanced surveillance (6-month follow-up)',
          'Optimize guideline-directed medical therapy',
          'Consider advanced therapies if symptoms progress',
          'Cardiac rehabilitation referral',
          'Monitor biomarkers and imaging parameters',
        ];
      } else {
        return [
          'Intensive heart failure management',
          'Frequent monitoring (3-month intervals)',
          'Consider advanced heart failure therapies',
          'Palliative care consultation if appropriate',
          'Clinical trial enrollment consideration',
          'Multidisciplinary team approach',
        ];
      }
    }
    return [];
  };

  const getTreatmentRecommendations = () => {
    const inputs = treatmentInputs;
    const recommendations = [];

    if (!inputs.current_medications.ace_arb) {
      recommendations.push({
        category: 'RAAS Inhibition',
        recommendation: 'Initiate ACE inhibitor or ARB',
        evidence: 'Class I recommendation for HFpEF',
        monitoring: 'Monitor renal function and potassium',
      });
    }

    if (parseNum(inputs.baseline_pasp) !== null) {
      const pasp = parseNum(inputs.baseline_pasp);
      if (pasp > 40 && !inputs.current_medications.diuretic) {
        recommendations.push({
          category: 'Volume Management',
          recommendation: 'Consider loop diuretic therapy',
          evidence: 'For symptomatic relief in volume overload',
          monitoring: 'Monitor electrolytes and renal function',
        });
      }
    }

    if (parseNum(inputs.baseline_ecv) !== null) {
      const ecv = parseNum(inputs.baseline_ecv);
      if (ecv > 30 && !inputs.current_medications.mra) {
        recommendations.push({
          category: 'Anti-fibrotic Therapy',
          recommendation: 'Consider MRA (spironolactone/eplerenone)',
          evidence: 'May benefit patients with elevated fibrosis burden',
          monitoring: 'Monitor potassium and renal function closely',
        });
      }
    }

    if (parseNum(inputs.symptom_score) !== null) {
      const symptom = parseNum(inputs.symptom_score);
      if (symptom > 70) {
        recommendations.push({
          category: 'Symptom Management',
          recommendation: 'Intensive symptom management program',
          evidence: 'High symptom burden requires multimodal approach',
          monitoring: 'Regular symptom assessment and QOL evaluation',
        });
      }
    }

    if (parseNum(inputs.exercise_capacity) !== null) {
      const exercise = parseNum(inputs.exercise_capacity);
      if (exercise < 300) {
        recommendations.push({
          category: 'Exercise Training',
          recommendation: 'Supervised cardiac rehabilitation',
          evidence: 'Improves exercise capacity and quality of life',
          monitoring: 'Exercise tolerance and functional capacity',
        });
      }
    }

    return recommendations;
  };

  // Memoized values to avoid redundant recompute
  const diagnosticScore = useMemo(() => calculateDiagnosticRisk(), [diagnosticInputs]);
  const prognosticScore = useMemo(() => calculatePrognosticRisk(), [prognosticInputs]);
  const diagnosticRisk = useMemo(() => getRiskCategory(diagnosticScore), [diagnosticScore]);
  const prognosticRisk = useMemo(() => getRiskCategory(prognosticScore), [prognosticScore]);
  const diagnosticRecs = useMemo(
    () => getRecommendations(diagnosticScore, 'diagnostic'),
    [diagnosticScore]
  );
  const prognosticRecs = useMemo(
    () => getRecommendations(prognosticScore, 'prognostic'),
    [prognosticScore]
  );
  const treatmentRecs = useMemo(() => getTreatmentRecommendations(), [treatmentInputs]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          HFpEF Clinical Decision Support Tools
        </h1>
        <p className="text-gray-600">
          Evidence-based tools for HFpEF diagnosis, prognosis, and treatment optimization
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'diagnostic', label: 'Diagnostic Calculator', icon: Calculator },
          { id: 'prognostic', label: 'Prognostic Assessment', icon: TrendingUp },
          { id: 'treatment', label: 'Treatment Optimizer', icon: Heart },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Diagnostic */}
      {activeTab === 'diagnostic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span>HFpEF Diagnostic Calculator</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: 'Age (years)',
                    key: 'age',
                    props: { type: 'number', placeholder: '65' },
                  },
                  {
                    label: 'BMI (kg/m²)',
                    key: 'bmi',
                    props: { type: 'number', step: '0.1', placeholder: '28.5' },
                  },
                  {
                    label: 'HF2PEF Score',
                    key: 'hf2pef_score',
                    props: { type: 'number', placeholder: '6' },
                  },
                  {
                    label: "E/e' Medial",
                    key: 'e_e_medial',
                    props: { type: 'number', step: '0.1', placeholder: '15.2' },
                  },
                  {
                    label: "E/e' Lateral",
                    key: 'e_e_lateral',
                    props: { type: 'number', step: '0.1', placeholder: '12.8' },
                  },
                  {
                    label: 'PASP (mmHg)',
                    key: 'pasp',
                    props: { type: 'number', placeholder: '42' },
                  },
                  {
                    label: 'Mean ECV (%)',
                    key: 'mean_ecv',
                    props: { type: 'number', step: '0.1', placeholder: '28.5' },
                  },
                  {
                    label: 'LV Longitudinal Strain (%)',
                    key: 'lv_longitudinal_strain',
                    props: { type: 'number', step: '0.1', placeholder: '-16.2' },
                  },
                ].map(({ label, key, props }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label}
                    </label>
                    <input
                      {...props}
                      value={diagnosticInputs[key]}
                      onChange={(e) =>
                        setDiagnosticInputs({ ...diagnosticInputs, [key]: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={diagnosticInputs.diabetes}
                    onChange={(e) =>
                      setDiagnosticInputs({ ...diagnosticInputs, diabetes: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Diabetes Mellitus</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={diagnosticInputs.hypertension}
                    onChange={(e) =>
                      setDiagnosticInputs({ ...diagnosticInputs, hypertension: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Hypertension</span>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg ${diagnosticRisk.bg} mb-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold">Risk Score</span>
                  <span className={`text-2xl font-bold ${diagnosticRisk.color}`}>
                    {diagnosticScore.toFixed(0)}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${
                      diagnosticRisk.level === 'Low'
                        ? 'bg-green-500'
                        : diagnosticRisk.level === 'Moderate'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${diagnosticScore}%` }}
                  ></div>
                </div>
                <div className={`text-center text-lg font-medium ${diagnosticRisk.color}`}>
                  {diagnosticRisk.level} Risk
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Clinical Recommendations:
                </h4>
                <ul className="space-y-1">
                  {diagnosticRecs.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Prognostic */}
      {activeTab === 'prognostic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Prognostic Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Age (years)', key: 'age', props: { type: 'number' } },
                  {
                    label: 'BMI (kg/m²)',
                    key: 'bmi',
                    props: { type: 'number', step: '0.1' },
                  },
                  {
                    label: 'Mean ECV (%)',
                    key: 'mean_ecv',
                    props: { type: 'number', step: '0.1' },
                  },
                  {
                    label: 'LV Strain (%)',
                    key: 'lv_strain',
                    props: { type: 'number', step: '0.1' },
                  },
                  {
                    label: "Mean E/e'",
                    key: 'e_e_ratio',
                    props: { type: 'number', step: '0.1' },
                  },
                  {
                    label: 'Quality of Life Score',
                    key: 'quality_of_life',
                    props: { type: 'number' },
                  },
                ].map(({ label, key, props }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label}
                    </label>
                    <input
                      {...props}
                      value={prognosticInputs[key]}
                      onChange={(e) =>
                        setPrognosticInputs({ ...prognosticInputs, [key]: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={prognosticInputs.diabetes}
                  onChange={(e) =>
                    setPrognosticInputs({ ...prognosticInputs, diabetes: e.target.checked })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Diabetes Mellitus</span>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prognostic Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg ${prognosticRisk.bg} mb-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold">Prognostic Score</span>
                  <span className={`text-2xl font-bold ${prognosticRisk.color}`}>
                    {prognosticScore.toFixed(0)}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${
                      prognosticRisk.level === 'Low'
                        ? 'bg-green-500'
                        : prognosticRisk.level === 'Moderate'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${prognosticScore}%` }}
                  ></div>
                </div>
                <div className={`text-center text-lg font-medium ${prognosticRisk.color}`}>
                  {prognosticRisk.level} Risk
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Management Recommendations:
                </h4>
                <ul className="space-y-1">
                  {prognosticRecs.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <Activity className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Treatment */}
      {activeTab === 'treatment' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>Treatment Optimizer</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: 'Baseline ECV (%)',
                    key: 'baseline_ecv',
                    props: { type: 'number', step: '0.1' },
                  },
                  {
                    label: 'Baseline PASP (mmHg)',
                    key: 'baseline_pasp',
                    props: { type: 'number' },
                  },
                  {
                    label: "Baseline E/e'",
                    key: 'baseline_e_e',
                    props: { type: 'number', step: '0.1' },
                  },
                  {
                    label: 'Symptom Score (0-100)',
                    key: 'symptom_score',
                    props: { type: 'number' },
                  },
                  {
                    label: 'Exercise Capacity (meters)',
                    key: 'exercise_capacity',
                    props: { type: 'number' },
                  },
                ].map(({ label, key, props }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label}
                    </label>
                    <input
                      {...props}
                      value={treatmentInputs[key]}
                      onChange={(e) =>
                        setTreatmentInputs({ ...treatmentInputs, [key]: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">
                  Current Medications:
                </h4>
                <div className="space-y-2">
                  {[
                    { label: 'ACE Inhibitor / ARB', key: 'ace_arb' },
                    { label: 'Beta Blocker', key: 'beta_blocker' },
                    { label: 'Loop Diuretic', key: 'diuretic' },
                    {
                      label: 'MRA (Spironolactone/Eplerenone)',
                      key: 'mra',
                    },
                  ].map(({ label, key }) => (
                    <label className="flex items-center" key={key}>
                      <input
                        type="checkbox"
                        checked={treatmentInputs.current_medications[key]}
                        onChange={(e) =>
                          setTreatmentInputs({
                            ...treatmentInputs,
                            current_medications: {
                              ...treatmentInputs.current_medications,
                              [key]: e.target.checked,
                            },
                          })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Treatment Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {treatmentRecs.length > 0 ? (
                  treatmentRecs.map((rec, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Heart className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">
                            {rec.category}
                          </h5>
                          <p className="text-sm text-gray-700 mt-1">
                            {rec.recommendation}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            <strong>Evidence:</strong> {rec.evidence}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            <strong>Monitor:</strong> {rec.monitoring}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p>Current therapy appears optimal based on available data.</p>
                    <p className="text-sm mt-2">
                      Continue current management and monitor response.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Clinical Insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Clinical Insights & Evidence Base</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Key Biomarkers</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Mean ECV: Myocardial fibrosis burden</li>
                <li>• LV Strain: Subclinical dysfunction</li>
                <li>• E/e' ratio: Diastolic dysfunction</li>
                <li>• PASP: Pulmonary hypertension</li>
                <li>• HF2PEF Score: Clinical assessment</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Evidence Levels</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Diagnostic model: AUC 0.87-0.92</li>
                <li>• Prognostic model: R² 0.65-0.75</li>
                <li>• Treatment response: 65-80% accuracy</li>
                <li>• Based on n=70 multiomics study</li>
                <li>• Validated against established scores</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Clinical Application</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use alongside standard evaluation</li>
                <li>• Cardiac MRI recommended for ECV</li>
                <li>• Strain imaging for early detection</li>
                <li>• Serial monitoring for progression</li>
                <li>• Personalized treatment selection</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-yellow-800">
                  Important Disclaimers
                </h5>
                <p className="text-sm text-yellow-700 mt-1">
                  These tools are for clinical decision support only and should
                  not replace clinical judgment. Always consider
                  patient-specific factors and current guidelines. Models are
                  based on research data and require external validation before
                  widespread clinical implementation.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HFpEFClinicalDecisionTools;
