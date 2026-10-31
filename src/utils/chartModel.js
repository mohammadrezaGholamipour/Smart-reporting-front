/**
 * مدل و تنظیمات نمودار (کاملاً مستقل از Vue تا قابل تست باشد).
 *
 * ورودی: component نوع chart از بک‌اند
 *   { chart_type, x_key, series: [...], data: [{...}] }
 * خروجی: option آمادهٔ ECharts با قالب‌بندی فارسی، راست‌به‌چپ و انتخاب هوشمند جهت/محور.
 */
import {
  compactNumber,
  faDecimal,
  formatValue,
  isPercentText,
  isPercentUnit,
  parseNumeric,
  splitLabelUnit,
  unitLabel,
} from './format'

const SHARE_RE = /share|percent|pct|ratio|rate|سهم|درصد|نسبت|نرخ/i
const GENERIC_KEY = /^(value|values|count|amount|total|y|data|مقدار|عدد|تعداد|مبلغ|مقدار)$/i
const TITLE_PERCENT = /درصد|percent|%|٪/i
const VALID_TYPES = ['bar', 'line', 'area', 'pie']

export const TYPE_LABELS = { bar: 'ستونی', line: 'خطی', area: 'ناحیه‌ای', pie: 'دایره‌ای' }

const MONTHS =
  /(^|\W)(فروردین|اردیبهشت|خرداد|تیر|مرداد|شهریور|مهر|آبان|آذر|دی|بهمن|اسفند|ژانویه|فوریه|مارس|آوریل|مه|ژوئن|ژوئیه|اوت|سپتامبر|اکتبر|نوامبر|دسامبر)(\W|$)|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b|\b(1[34]\d\d|19\d\d|20\d\d)\b|\bq[1-4]\b|هفته|فصل|week|quarter/i

const toLatin = (s) => String(s).replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))

/** آیا بیشتر برچسب‌ها زمانی‌اند (ماه، سال، فصل)؟ */
export function looksTemporal(labels) {
  const list = labels.filter(Boolean).map(toLatin)
  if (list.length < 2) return false
  return list.filter((l) => MONTHS.test(l)).length / list.length >= 0.6
}

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

function withAlpha(color, alpha) {
  const hex = String(color).trim()
  if (/^#[0-9a-f]{6}$/i.test(hex)) return hex + Math.round(alpha * 255).toString(16).padStart(2, '0')
  return color
}

// ---------------------------------------------------------------------------
// مدل داده
// ---------------------------------------------------------------------------

export function normalizeChart(component) {
  const rows = Array.isArray(component?.data) ? component.data.filter((r) => r && typeof r === 'object') : []
  const empty = { valid: false, type: 'bar', labels: [], series: [], count: 0, temporal: false }
  if (!rows.length) return empty

  const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))]
  const isNumericKey = (k) => rows.filter((r) => parseNumeric(r[k]) !== null).length >= rows.length / 2

  let xKey = keys.includes(component.x_key) ? component.x_key : keys.find((k) => !isNumericKey(k)) ?? keys[0]

  let seriesKeys = (Array.isArray(component.series) ? component.series : []).filter((k) => keys.includes(k) && k !== xKey)
  if (!seriesKeys.length) seriesKeys = keys.filter((k) => k !== xKey && rows.some((r) => parseNumeric(r[k]) !== null))

  const series = seriesKeys
    .map((key) => {
      const split = splitLabelUnit(key)
      const unit = split.unit
      // کلید عمومی مثل «value» برای کاربر معنایی ندارد؛ عنوان نمودار جایگزین می‌شود.
      const label = GENERIC_KEY.test(split.label) && component.title ? component.title : split.label
      const values = rows.map((r) => parseNumeric(r[key]))
      const nums = values.filter((v) => v !== null)
      return {
        key,
        label,
        unit,
        percent:
          isPercentUnit(unit) ||
          rows.some((r) => isPercentText(r[key])) ||
          SHARE_RE.test(key) ||
          TITLE_PERCENT.test(`${component.title ?? ''} ${component.description ?? ''}`),
        values,
        max: nums.length ? Math.max(...nums.map(Math.abs)) : 0,
        hasData: nums.length > 0,
      }
    })
    .filter((s) => s.hasData)

  if (!series.length) return empty

  const labels = rows.map((r, i) => (r[xKey] == null || r[xKey] === '' ? `مورد ${i + 1}` : String(r[xKey])))
  const type = VALID_TYPES.includes(component.chart_type) ? component.chart_type : 'bar'

  return { valid: true, type, xKey, labels, series, count: rows.length, temporal: looksTemporal(labels) }
}

/** نوع‌هایی که برای این داده معنا دارند (برای دکمهٔ تغییر نوع نمودار). */
export function availableTypes(model) {
  if (!model.valid) return []
  const types = ['bar', 'line', 'area']
  const s = model.series[0]
  const pieOk =
    model.series.length === 1 &&
    model.count >= 2 &&
    model.count <= 24 &&
    !model.temporal &&
    s.values.every((v) => v === null || v >= 0) &&
    s.values.some((v) => v > 0)
  if (pieOk) types.push('pie')
  return types
}

const fmtFull = (v, s) => formatValue(v, { unit: s.unit, percent: s.percent })
const fmtAxis = (v, s) => (s.percent ? `${faDecimal(v)}٪` : compactNumber(v))
const fmtLabel = (v, s) => (s.percent ? `${faDecimal(v)}٪` : formatValue(v, { compact: true }))

// ---------------------------------------------------------------------------
// ساخت option
// ---------------------------------------------------------------------------

function baseOption(c) {
  return {
    textStyle: { fontFamily: c.font },
    color: c.palette,
    animationDuration: 600,
    animationEasing: 'cubicOut',
    tooltip: {
      confine: true,
      backgroundColor: c.card,
      borderColor: c.line,
      padding: [10, 14],
      textStyle: { color: c.ink, fontFamily: c.font, fontSize: 13 },
      extraCssText: 'direction: rtl; text-align: right; box-shadow: 0 8px 24px rgba(0,0,0,.12); border-radius: 12px;',
    },
  }
}

function axisTooltip(model) {
  return {
    trigger: 'axis',
    axisPointer: { type: 'shadow', shadowStyle: { opacity: 0.06 } },
    formatter: (params) => {
      const list = Array.isArray(params) ? params : [params]
      const head = `<div style="font-weight:700;margin-bottom:6px">${esc(list[0]?.axisValueLabel ?? list[0]?.name)}</div>`
      const body = list
        .map((p) => {
          const s = model.series[p.seriesIndex]
          const value = p.value == null ? '—' : fmtFull(p.value, s)
          return `<div style="display:flex;justify-content:space-between;gap:20px;line-height:1.9"><span>${p.marker}${esc(s.label)}</span><b>${esc(value)}</b></div>`
        })
        .join('')
      return head + body
    },
  }
}

function legendOption(model, c, top = 0) {
  if (model.series.length < 2) return undefined
  return {
    type: 'scroll',
    top,
    itemGap: 18,
    icon: 'roundRect',
    textStyle: { color: c.soft, fontFamily: c.font },
    pageTextStyle: { color: c.mute },
    formatter: (name) => model.series.find((s) => s.key === name)?.label ?? name,
  }
}

/** در چند سری با مقیاس بسیار متفاوت (مثلاً ریال و تعداد) محور دوم لازم است. */
function assignAxes(series) {
  const maxes = series.map((s) => s.max || 0).filter(Boolean)
  if (series.length < 2 || !maxes.length) return series.map(() => 0)
  const hi = Math.max(...maxes)
  const lo = Math.min(...maxes)
  if (hi / Math.max(lo, 1e-9) < 8) return series.map(() => 0)
  const pivot = Math.sqrt(hi * lo)
  return series.map((s) => (s.max >= pivot ? 0 : 1))
}

function axisLine(c) {
  return { lineStyle: { color: c.line } }
}

function buildPie(model, c) {
  const s = model.series[0]
  let items = model.labels
    .map((name, i) => ({ name, value: s.values[i] }))
    .filter((d) => d.value !== null && d.value > 0)
    .sort((a, b) => b.value - a.value)

  const MAX = 8
  if (items.length > MAX) {
    const rest = items.slice(MAX - 1)
    items = [...items.slice(0, MAX - 1), { name: 'سایر', value: rest.reduce((sum, d) => sum + d.value, 0) }]
  }

  const total = items.reduce((sum, d) => sum + d.value, 0)

  return {
    height: 20 * 16,
    option: {
      ...baseOption(c),
      title: s.percent
        ? undefined
        : {
            text: formatValue(total, { compact: true }),
            subtext: 'مجموع',
            left: 'center',
            top: '37%',
            textStyle: { color: c.ink, fontFamily: c.font, fontSize: 20, fontWeight: 700 },
            subtextStyle: { color: c.mute, fontFamily: c.font, fontSize: 12 },
          },
      tooltip: {
        ...baseOption(c).tooltip,
        trigger: 'item',
        formatter: (p) =>
          `<div style="font-weight:700;margin-bottom:4px">${p.marker}${esc(p.name)}</div>` +
          `<div style="display:flex;justify-content:space-between;gap:20px"><span>مقدار</span><b>${esc(fmtFull(p.value, s))}</b></div>` +
          `<div style="display:flex;justify-content:space-between;gap:20px"><span>سهم</span><b>${esc(faDecimal(p.percent))}٪</b></div>`,
      },
      legend: {
        type: 'scroll',
        bottom: 0,
        icon: 'circle',
        itemGap: 16,
        textStyle: { color: c.soft, fontFamily: c.font },
        pageTextStyle: { color: c.mute },
      },
      series: [
        {
          type: 'pie',
          radius: ['46%', '68%'],
          center: ['50%', '44%'],
          padAngle: 2,
          minShowLabelAngle: 8,
          itemStyle: { borderRadius: 8, borderColor: c.card, borderWidth: 2 },
          label: {
            color: c.soft,
            fontFamily: c.font,
            formatter: (p) => `${p.name}\n${faDecimal(p.percent)}٪`,
            lineHeight: 18,
          },
          labelLine: { length: 12, length2: 10, lineStyle: { color: c.line } },
          labelLayout: { hideOverlap: true },
          emphasis: { scale: true, scaleSize: 6 },
          data: items,
        },
      ],
    },
  }
}

function buildBar(model, c) {
  const maxLabel = Math.max(...model.labels.map((l) => l.length))
  const horizontal = model.count > 7 || maxLabel > 16
  const axes = assignAxes(model.series)
  const single = model.series.length === 1
  const s0 = model.series[0]

  let labels = model.labels
  let seriesValues = model.series.map((s) => s.values)

  // نمودار تک‌سری غیرزمانی: مرتب‌سازی نزولی تا مقایسه آسان شود
  if (single && !model.temporal) {
    const order = labels.map((_, i) => i).sort((a, b) => (s0.values[b] ?? -Infinity) - (s0.values[a] ?? -Infinity))
    labels = order.map((i) => model.labels[i])
    seriesValues = [order.map((i) => s0.values[i])]
  }

  const peak = single ? Math.max(...seriesValues[0].filter((v) => v !== null)) : null

  const series = model.series.map((s, i) => ({
    name: s.key,
    type: 'bar',
    yAxisIndex: horizontal ? 0 : axes[i],
    barMaxWidth: horizontal ? 22 : 46,
    barGap: '12%',
    data: seriesValues[i].map((v) =>
      single
        ? { value: v, itemStyle: { color: v === peak ? c.palette[0] : withAlpha(c.palette[0], 0.55) } }
        : v,
    ),
    itemStyle: {
      borderRadius: horizontal ? [0, 8, 8, 0] : [8, 8, 0, 0],
      ...(single ? {} : { color: c.palette[i % c.palette.length] }),
    },
    showBackground: horizontal && single,
    backgroundStyle: { color: c.line, opacity: 0.3, borderRadius: 8 },
    label: {
      show: model.count <= 12 && model.series.length <= 2,
      position: horizontal ? 'left' : 'top',
      color: c.soft,
      fontFamily: c.font,
      fontSize: 12,
      formatter: (p) => (p.value == null ? '' : fmtLabel(p.value, s)),
    },
    emphasis: { focus: 'series' },
    markLine:
      single && model.count >= 3 && !horizontal && Math.max(...s0.values.filter((v) => v !== null)) !== Math.min(...s0.values.filter((v) => v !== null))
        ? {
            silent: true,
            symbol: 'none',
            lineStyle: { color: c.saffron, type: 'dashed', width: 1.5 },
            label: { position: 'insideEndTop', color: c.saffron, fontFamily: c.font, formatter: (p) => `میانگین: ${fmtLabel(p.value, s)}` },
            data: [{ type: 'average' }],
          }
        : undefined,
  }))

  if (horizontal) {
    const rowH = 18 + model.series.length * 14
    return {
      height: Math.max(288, model.count * rowH + 70),
      option: {
        ...baseOption(c),
        legend: legendOption(model, c),
        grid: { top: single ? 12 : 44, right: 12, left: 96, bottom: 12, containLabel: true },
        tooltip: { ...baseOption(c).tooltip, ...axisTooltip(model), axisPointer: { type: 'shadow', shadowStyle: { opacity: 0.06 } } },
        xAxis: { type: 'value', inverse: true, show: false, max: (v) => v.max * 1.12 },
        yAxis: {
          type: 'category',
          inverse: true,
          position: 'right',
          data: labels,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: c.ink, fontFamily: c.font, fontSize: 12, width: 130, overflow: 'truncate', margin: 12 },
        },
        series,
      },
    }
  }

  const zoom = model.count > 14
  const dual = new Set(axes).size > 1
  return {
    height: 20 * 16 + (zoom ? 40 : 0),
    option: {
      ...baseOption(c),
      legend: legendOption(model, c),
      grid: { top: single ? 36 : 52, right: 16, left: dual ? 16 : 12, bottom: zoom ? 64 : 12, containLabel: true },
      tooltip: { ...baseOption(c).tooltip, ...axisTooltip(model) },
      xAxis: {
        type: 'category',
        inverse: true,
        data: labels,
        axisLine: axisLine(c),
        axisTick: { show: false },
        axisLabel: { color: c.soft, fontFamily: c.font, hideOverlap: true, width: 90, overflow: 'truncate' },
      },
      yAxis: valueAxes(model, axes, c),
      dataZoom: zoom ? zoomOptions(c) : undefined,
      series,
    },
  }
}

function valueAxes(model, axes, c) {
  const used = [...new Set(axes)].sort()
  return used.map((axisIndex) => {
    const sample = model.series.find((_, i) => axes[i] === axisIndex)
    const unit = unitLabel(sample.unit)
    // در نمودار دو محوره، رنگ برچسب هر محور با رنگ سری خودش یکی است تا خوانده شود کدام محور مال کدام سری است.
    const dual = used.length > 1
    const color = dual ? c.palette[model.series.indexOf(sample) % c.palette.length] : c.mute
    const name = dual ? sample.label : unit && !sample.percent ? unit : ''
    return {
      type: 'value',
      boundaryGap: [0, '8%'], // کمی فضای خالی بالای بلندترین ستون/نقطه
      position: axisIndex === 0 ? 'right' : 'left',
      name,
      nameTextStyle: { color, fontFamily: c.font },
      axisLabel: { color, fontFamily: c.font, formatter: (v) => fmtAxis(v, sample) },
      splitLine: axisIndex === 0 ? { lineStyle: { color: c.line, type: 'dashed' } } : { show: false },
    }
  })
}

function zoomOptions(c) {
  return [
    { type: 'inside' },
    {
      type: 'slider',
      height: 18,
      bottom: 12,
      borderColor: 'transparent',
      backgroundColor: withAlpha(c.line, 0.4),
      fillerColor: withAlpha(c.brand, 0.18),
      handleStyle: { color: c.brand },
      textStyle: { color: c.mute, fontFamily: c.font },
    },
  ]
}

function buildLine(model, c, area) {
  const axes = assignAxes(model.series)
  const single = model.series.length === 1
  const zoom = model.count > 14
  const dual = new Set(axes).size > 1

  const series = model.series.map((s, i) => {
    const color = c.palette[i % c.palette.length]
    return {
      name: s.key,
      type: 'line',
      yAxisIndex: axes[i],
      smooth: model.count > 2 ? 0.25 : false,
      symbol: 'circle',
      symbolSize: model.count > 20 ? 4 : 9,
      showSymbol: model.count <= 20,
      data: s.values,
      connectNulls: true,
      lineStyle: { color, width: 3 },
      itemStyle: { color, borderColor: c.card, borderWidth: 2 },
      areaStyle:
        area || single
          ? {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: withAlpha(color, area ? 0.4 : 0.22) },
                  { offset: 1, color: withAlpha(color, 0.02) },
                ],
              },
            }
          : undefined,
      emphasis: { focus: 'series' },
      label: {
        show: model.count <= 8 && model.series.length === 1,
        position: 'top',
        color: c.soft,
        fontFamily: c.font,
        fontSize: 12,
        formatter: (p) => (p.value == null ? '' : fmtLabel(p.value, s)),
      },
      markPoint:
        single && model.count >= 4
          ? {
              symbolSize: 46,
              itemStyle: { color: c.saffron },
              label: { color: '#fff', fontFamily: c.font, fontSize: 10, formatter: (p) => fmtLabel(p.value, s) },
              data: [{ type: 'max' }, { type: 'min' }],
            }
          : undefined,
    }
  })

  return {
    height: 20 * 16 + (zoom ? 40 : 0),
    option: {
      ...baseOption(c),
      legend: legendOption(model, c),
      grid: { top: single ? 40 : 56, right: 16, left: dual ? 16 : 12, bottom: zoom ? 64 : 12, containLabel: true },
      tooltip: { ...baseOption(c).tooltip, ...axisTooltip(model), axisPointer: { type: 'line', lineStyle: { color: c.line, type: 'dashed' } } },
      xAxis: {
        type: 'category',
        inverse: true,
        // با نقطه‌های کم، فاصله از لبه‌ها می‌ماند تا برچسب‌های ابتدا و انتها بریده نشوند
        boundaryGap: model.count <= 12,
        data: model.labels,
        axisLine: axisLine(c),
        axisTick: { show: false },
        axisLabel: { color: c.soft, fontFamily: c.font, hideOverlap: true, width: 90, overflow: 'truncate' },
      },
      yAxis: valueAxes(model, axes, c),
      dataZoom: zoom ? zoomOptions(c) : undefined,
      series,
    },
  }
}

/** @returns {{ option: object, height: number }} ارتفاع بر حسب پیکسل */
export function buildChartOption(model, type, theme) {
  if (!model.valid) return { option: {}, height: 200 }
  const chosen = availableTypes(model).includes(type) ? type : model.type === 'pie' ? 'bar' : model.type
  if (chosen === 'pie') return buildPie(model, theme)
  if (chosen === 'line') return buildLine(model, theme, false)
  if (chosen === 'area') return buildLine(model, theme, true)
  return buildBar(model, theme)
}

/** نوع پیش‌فرض: اگر نوع پیشنهادی بک‌اند برای داده معنا ندارد، نوع مناسب انتخاب می‌شود. */
export function defaultType(model) {
  const types = availableTypes(model)
  if (types.includes(model.type)) return model.type
  if (model.type === 'pie') return model.temporal ? 'line' : 'bar'
  return 'bar'
}
