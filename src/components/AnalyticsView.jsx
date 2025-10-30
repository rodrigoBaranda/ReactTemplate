import { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import { theme } from '../styles/theme';

function AnalyticsView() {
  const [deliveryTrends, setDeliveryTrends] = useState([]);
  const [delayAnalysis, setDelayAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);

  const trendChartRef = useRef(null);
  const delayChartRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch('/data/delivery-trends.json').then(res => res.json()),
      fetch('/data/delay-analysis.json').then(res => res.json())
    ])
      .then(([trendsData, delaysData]) => {
        setDeliveryTrends(trendsData);
        setDelayAnalysis(delaysData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading data:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading && deliveryTrends.length > 0 && trendChartRef.current) {
      drawTrendChart();
    }
  }, [loading, deliveryTrends]);

  useEffect(() => {
    if (!loading && delayAnalysis.length > 0 && delayChartRef.current) {
      drawDelayChart();
    }
  }, [loading, delayAnalysis]);

  const drawTrendChart = () => {
    const container = trendChartRef.current;
    d3.select(container).select('svg').remove();

    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse dates
    const parseDate = d3.timeParse('%Y-%m-%d');
    const data = deliveryTrends.map(d => ({
      ...d,
      date: parseDate(d.date)
    }));

    // X scale
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, width]);

    // Y scale
    const y = d3.scaleLinear()
      .domain([85, 100])
      .range([height, 0]);

    // Line generator
    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.on_time_rate))
      .curve(d3.curveMonotoneX);

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%b %d')))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '12px');

    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + '%'))
      .style('font-size', '12px');

    // Add Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .text('On-Time Delivery Rate (%)');

    // Add the line
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', theme.colors.primary)
      .attr('stroke-width', 3)
      .attr('d', line);

    // Add dots
    svg.selectAll('dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.on_time_rate))
      .attr('r', 4)
      .attr('fill', theme.colors.primary)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .append('title')
      .text(d => `${d3.timeFormat('%b %d')(d.date)}: ${d.on_time_rate}%`);

    // Add reference line at 95%
    svg.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', y(95))
      .attr('y2', y(95))
      .attr('stroke', theme.colors.success)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.5);

    svg.append('text')
      .attr('x', width - 5)
      .attr('y', y(95) - 5)
      .attr('text-anchor', 'end')
      .style('font-size', '12px')
      .style('fill', theme.colors.success)
      .text('Target: 95%');
  };

  const drawDelayChart = () => {
    const container = delayChartRef.current;
    d3.select(container).select('svg').remove();

    const margin = { top: 30, right: 30, bottom: 90, left: 70 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create gradient for Accenture purple
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'purpleGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', theme.colors.primary)
      .attr('stop-opacity', 1);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', theme.colors.primary)
      .attr('stop-opacity', 0.7);

    // X scale
    const x = d3.scaleBand()
      .domain(delayAnalysis.map(d => d.carrier))
      .range([0, width])
      .padding(0.4);

    // Y scale with some padding at top
    const maxDelay = d3.max(delayAnalysis, d => d.avg_delay_hours);
    const y = d3.scaleLinear()
      .domain([0, maxDelay * 1.15])
      .range([height, 0]);

    // X axis with Accenture styling
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-35)')
      .style('text-anchor', 'end')
      .style('font-size', '13px')
      .style('font-weight', '500')
      .style('fill', theme.colors.text);

    // Y axis with grid lines
    const yAxis = svg.append('g')
      .call(d3.axisLeft(y).ticks(6))
      .style('font-size', '12px')
      .style('font-weight', '500');

    // Add grid lines
    svg.selectAll('line.grid')
      .data(y.ticks(6))
      .enter()
      .append('line')
      .attr('class', 'grid')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', theme.colors.border)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.3);

    // Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 10)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('fill', theme.colors.text)
      .text('Average Delay (hours)');

    // Bars with gradient
    const bars = svg.selectAll('bar')
      .data(delayAnalysis)
      .enter()
      .append('rect')
      .attr('x', d => x(d.carrier))
      .attr('width', x.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', 'url(#purpleGradient)')
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseover', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1);
      });

    // Animate bars
    bars.transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr('y', d => y(d.avg_delay_hours))
      .attr('height', d => height - y(d.avg_delay_hours));

    // Add value labels on bars with white background
    const labels = svg.selectAll('text.label')
      .data(delayAnalysis)
      .enter()
      .append('g')
      .attr('class', 'label-group');

    labels.append('rect')
      .attr('x', d => x(d.carrier) + x.bandwidth() / 2 - 20)
      .attr('y', d => y(d.avg_delay_hours) - 25)
      .attr('width', 40)
      .attr('height', 20)
      .attr('fill', 'white')
      .attr('rx', 3)
      .attr('stroke', theme.colors.primary)
      .attr('stroke-width', 1.5)
      .style('opacity', 0)
      .transition()
      .delay((d, i) => i * 100 + 1000)
      .duration(300)
      .style('opacity', 1);

    labels.append('text')
      .attr('x', d => x(d.carrier) + x.bandwidth() / 2)
      .attr('y', d => y(d.avg_delay_hours) - 11)
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('font-weight', 'bold')
      .style('fill', theme.colors.primary)
      .style('opacity', 0)
      .text(d => d.avg_delay_hours.toFixed(1) + 'h')
      .transition()
      .delay((d, i) => i * 100 + 1000)
      .duration(300)
      .style('opacity', 1);

    // Add tooltips
    bars.append('title')
      .text(d => `${d.carrier}\nAvg Delay: ${d.avg_delay_hours.toFixed(1)} hours\nIncidents: ${d.delay_count}\nPrimary Reason: ${d.primary_reason}`);
  };

  const styles = {
    container: {
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.backgroundLight
    },
    header: {
      marginBottom: theme.spacing.lg
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
      gap: theme.spacing.lg
    },
    chartCard: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      boxShadow: theme.shadows.md,
      border: `1px solid ${theme.colors.border}`
    },
    chartTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      borderBottom: `2px solid ${theme.colors.primary}`
    },
    chartContainer: {
      width: '100%',
      minHeight: '400px'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Loading analytics...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Supply Chain Analytics</h2>
      </div>

      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>On-Time Delivery Trends (30 Days)</h3>
          <div ref={trendChartRef} style={styles.chartContainer}></div>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Average Delays by Carrier</h3>
          <div ref={delayChartRef} style={styles.chartContainer}></div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsView;
