import CanvasJS from "@canvasjs/charts";

/** This class is used to create a chart controller that can be used to switch between charts. */
export default class ChartController {
  public chart: CanvasJS.Chart;
  public configs: object[];
  public chart_id: string;
  constructor(chart_id: string) {
    this.configs = [];
    this.chart_id = chart_id;
  }
  /**
   * Switches the chart to the specified index.
   * @param index - The index of the chart to switch to.
   */
  public switch_chart(index: number): void {
    this.chart = new CanvasJS.Chart(this.chart_id, this.configs[index]);
  }
  /**
   * Adds a chart configuration to the chart controller.
   * @param title - The title of the chart.
   * @param x_axis - The title of the x-axis.
   * @param y_axis - The title of the y-axis.
   * @param data_points - The data points to display on the chart.
   * @param max - The maximum value of the y-axis.
   */
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
