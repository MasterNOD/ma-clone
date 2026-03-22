import { useEffect, useRef } from "react";
import * as d3 from "d3";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PriceChartProps {
  data:        Record<string, number>;
  productName: string;
  brandName:   string;
}

// ── Config ────────────────────────────────────────────────────────────────────

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const BRAND_COLORS: Record<string, string> = {
  Samsung: "#1428A0",
  LG:      "#A50034",
  Hisense: "#00A8B0",
};

const MARGIN = { top: 30, right: 30, bottom: 50, left: 70 };

// ── Component ─────────────────────────────────────────────────────────────────

const PriceChart = ({ data, productName, brandName }: PriceChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
    if (!svgRef.current || !data) return;

    const draw = () => {
      const container = svgRef.current?.parentElement;
      if (!container) return;

      const totalWidth  = container.clientWidth;
      const totalHeight = 380;
      const width       = totalWidth  - MARGIN.left - MARGIN.right;
      const height      = totalHeight - MARGIN.top  - MARGIN.bottom;

      d3.select(svgRef.current).selectAll("*").remove();

      const svg = d3.select(svgRef.current)
        .attr("width",  totalWidth)
        .attr("height", totalHeight)
        .append("g")
        .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

      const chartData = MONTHS.map((month) => ({
        month,
        price: data[month] ?? 0,
      }));

      const color = BRAND_COLORS[brandName] ?? "#6c757d";

      const xScale = d3.scalePoint()
        .domain(MONTHS)
        .range([0, width])
        .padding(0.2);

      const minPrice = d3.min(chartData, (d) => d.price) ?? 0;
      const maxPrice = d3.max(chartData, (d) => d.price) ?? 0;
      const padding  = (maxPrice - minPrice) * 0.1;

      const yScale = d3.scaleLinear()
        .domain([minPrice - padding, maxPrice + padding])
        .range([height, 0])
        .nice();

      // Grid lines
      svg.append("g")
        .attr("class", "grid")
        .call(
          d3.axisLeft(yScale)
            .tickSize(-width)
            .tickFormat(() => "")
        )
        .selectAll("line")
        .attr("stroke", "#e9ecef")
        .attr("stroke-dasharray", "4,4");

      svg.select(".grid .domain").remove();

      // Area fill
      const area = d3.area<{ month: string; price: number }>()
        .x((d) => xScale(d.month) ?? 0)
        .y0(height)
        .y1((d) => yScale(d.price))
        .curve(d3.curveCatmullRom);

      svg.append("path")
        .datum(chartData)
        .attr("fill", color)
        .attr("fill-opacity", 0.08)
        .attr("d", area);

      // Line
      const line = d3.line<{ month: string; price: number }>()
        .x((d) => xScale(d.month) ?? 0)
        .y((d) => yScale(d.price))
        .curve(d3.curveCatmullRom);

      const path = svg.append("path")
        .datum(chartData)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2.5)
        .attr("d", line);

      // Animate only on first draw, not on resize
      const pathLength = (path.node() as SVGPathElement).getTotalLength();
      path
        .attr("stroke-dasharray", pathLength)
        .attr("stroke-dashoffset", isResizing.current ? 0 : pathLength)
        .transition()
        .duration(isResizing.current ? 0 : 1000)
        .ease(d3.easeCubicInOut)
        .attr("stroke-dashoffset", 0);

      // Tooltip
      const tooltip = d3.select("body")
        .selectAll(".price-tooltip")
        .data([null])
        .join("div")
        .attr("class", "price-tooltip")
        .style("position",      "fixed")
        .style("background",    "rgba(0,0,0,0.75)")
        .style("color",         "white")
        .style("padding",       "6px 12px")
        .style("border-radius", "8px")
        .style("font-size",     "13px")
        .style("pointer-events","none")
        .style("opacity",       "0")
        .style("z-index",       "9999");

      // Dots
      svg.selectAll(".dot")
        .data(chartData)
        .join("circle")
        .attr("class",        "dot")
        .attr("cx",           (d) => xScale(d.month) ?? 0)
        .attr("cy",           (d) => yScale(d.price))
        .attr("r",            4)
        .attr("fill",         color)
        .attr("stroke",       "white")
        .attr("stroke-width", 2)
        .style("cursor",      "pointer")
        .style("opacity",     isResizing.current ? 1 : 0)
        .transition()
        .delay(isResizing.current ? 0 : 900)
        .style("opacity", 1)
        .selection()
        .on("mouseenter", (event, d) => {
          d3.select(event.currentTarget)
            .transition().duration(150)
            .attr("r", 7);
          tooltip
            .style("opacity", "1")
            .html(`<strong>${d.month}</strong><br/>$${d.price.toFixed(2)}`);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", `${event.clientX + 14}px`)
            .style("top",  `${event.clientY - 28}px`);
        })
        .on("mouseleave", (event) => {
          d3.select(event.currentTarget)
            .transition().duration(150)
            .attr("r", 4);
          tooltip.style("opacity", "0");
        });

      // X Axis
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("font-size", "12px")
        .attr("fill",      "#6c757d");

      svg.select(".domain").attr("stroke", "#dee2e6");
      svg.selectAll(".tick line").attr("stroke", "#dee2e6");

      // Y Axis
      svg.append("g")
        .call(
          d3.axisLeft(yScale)
            .tickFormat((d) => `$${d3.format(",.0f")(d as number)}`)
        )
        .selectAll("text")
        .attr("font-size", "12px")
        .attr("fill",      "#6c757d");

      // Min / Max labels
      const minPoint = chartData.reduce((a, b) => a.price < b.price ? a : b);
      const maxPoint = chartData.reduce((a, b) => a.price > b.price ? a : b);

      [
        { point: minPoint, label: "Low",  offset: 18  },
        { point: maxPoint, label: "High", offset: -10 },
      ].forEach(({ point, label, offset }) => {
        svg.append("text")
          .attr("x",           xScale(point.month) ?? 0)
          .attr("y",           yScale(point.price) + offset)
          .attr("text-anchor", "middle")
          .attr("font-size",   "11px")
          .attr("fill",        color)
          .attr("font-weight", "600")
          .text(`${label}: $${point.price.toFixed(2)}`);
      });
    };

    // Track if we are resizing to skip animation
    const isResizing = { current: false };

    draw();

    const handleResize = () => {
      isResizing.current = true;
      draw();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      d3.select("body").selectAll(".price-tooltip").remove();
    };

  }, [data, productName, brandName]);
  

  return <svg ref={svgRef} style={{ width: "100%", display: "block" }} />;
};

export default PriceChart;