import CanvasJS from "@canvasjs/charts";

export default class ChartController {
  public chart: CanvasJS.Chart;
  public configs: object[];
  public chart_id: string;
  constructor(chart_id: string) {
    this.configs = [];
    this.chart_id = chart_id;
  }
  public switch_chart(index: number): void {
    this.chart = new CanvasJS.Chart(this.chart_id, this.configs[index]);
  }
  public add_config(title, x_axis, y_axis, data_points, max: number | null = null): void {
    this.configs.push({
      title: {
        text: title,
      },
      axisY: {
        title: y_axis,
        maximum: max,
      },
      axisX: {
        title: x_axis,
        minimum: 0,
      },
      zoomEnabled: true,

      data: [
        {
          name: "Data",
          type: "area",
          color: "rgba(0, 102, 204, 0.5)",
          markerSize: 0,
          dataPoints: data_points,
        },
      ],
    });
  }
}
