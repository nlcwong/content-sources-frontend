# LwMetricsDonutChart — roadmap

**Scope:** this unit only — PF `ChartDonut` host, series API, colors, tooltips,
legend passthrough, web container ref.  
**Not here:** Lens report types, coverage copy, stack chart, family inventory,
product slice catalogs (Beacon On Hold / In Pipeline, etc.).  
**Prerequisite:** this file + [`README.md`](./README.md) before unit `*.tsx`.

**Family:** [`../ROADMAP.md`](../ROADMAP.md) · Extract plan:
[`../examples/lens-coverage-layout-extract.md`](../examples/lens-coverage-layout-extract.md)

---

## Job

Configurable **donut / utilization** metrics surface. Pages pass series + labels;
kit owns PF chart harness and default match-status color scale.

**Host:** PatternFly Charts `ChartDonut` (Victory). Optional wrapping `div` for
resize-observer call sites (ref on container).

**Convention:** [PF Resize Observer](https://www.patternfly.org/components/charts/resize-observer#responsive-bullet-chart-with-wrapping-legend)
— call site measures width; unit renders at given `width` / `height`. Legend
wrapping follows that same PF Charts convention; do not redefine it here.

---

## Proposed API

```tsx
<LwMetricsDonutChart
  data={[
    { x: 'Exact match', y: 60 },
    { x: 'Partial match', y: 15 },
    { x: 'No match', y: 25 },
  ]}
  width={320}
  height={280}
  title='75%'
  subTitle='packages matched'
  legendData={[{ name: 'Exact match' }, { name: 'Partial match' }, { name: 'No match' }]}
  legendPosition='bottom'
  containerRef={containerRef}
/>
```

| Prop                    | Role                                                                  |
| ----------------------- | --------------------------------------------------------------------- |
| `data`                  | `{ x, y }[]` slices                                                   |
| `width` / `height`      | Chart box                                                             |
| `title` / `subTitle?`   | Center labels                                                         |
| `colorScale?`           | Default: match-status exact → partial → none                          |
| `allowTooltip?`         | Default true                                                          |
| `getLabel?`             | Tooltip label fn                                                      |
| `legendData?`           | PF `ChartDonut` legend series (`{ name }[]`)                          |
| `legendPosition?`       | PF `'bottom' \| 'right'`; defaults to `'bottom'` when `legendData` set |
| `legendOrientation?`    | PF `'horizontal' \| 'vertical'`                                       |
| `legendAllowWrap?`      | PF wrap; prefer callback so call site can grow `height`               |
| `containerRef?`         | Web measure host                                                      |
| `ariaDesc?`             | A11y                                                                  |

Legend props are **PF name passthrough** on `ChartDonut` — no renamed twins, no
custom HTML legend sibling. Default `padding.bottom` increases when a bottom
legend is active; call sites that use wrapping legends must still add wrap
extra height per the family Resize Observer convention.

---

## Phases

| Phase | Deliverable                                                           | Done when |
| ----- | --------------------------------------------------------------------- | --------- |
| D0    | README + this roadmap                                                 | Docs      |
| D1    | Shell + defaults + unit test                                          | Green     |
| D2    | Barrel; Lens CoverageReport compose; thin Lens `MatchDonutChart` wrap | Replace   |
| D3    | PF legend passthrough (`legendData` / position / orientation)         | Green     |

**Progress:** D0 → D2 in extract pass; D3 for bottom-legend consumers (e.g. Beacon summary).
