<script>
    import {Line} from 'vue-chartjs'

    export default {
        data() {
            return {
                datasets: [],
            }
        },
        extends: Line,
        props: [
            'height',
            'statData',
            'labels',
            'metrics',
            'colors'
        ],
        mounted() {
            this.make();
        },
        methods: {
            make() {
                let borderColors = this.colors;
                let labels = this.labels;
                let metrics = this.metrics;
                let loop = 0;

                for (let metric in metrics) {
                    loop++;
                    this.datasets.push({
                        data: this.statData[metrics[metric]],
                        borderColor: borderColors[metric],
                        backgroundColor: this.convertHex(borderColors[metric], 10),
                        label: metrics[metric],
                    });
                }

                this.renderChart({
                    labels: labels,
                    datasets: this.datasets
                }, {
                    maintainAspectRatio: false,
                    legend: {
                        display: true
                    },
                    scales: {
                        xAxes: [{
                            gridLines: {
                                drawOnChartArea: false
                            }
                        }],
                        yAxes: [{
                            gridLines: {
                                display: true
                            },
                        }]
                    },
                    elements: {
                        point: {
                            radius: 0,
                            hitRadius: 10,
                            hoverRadius: 4,
                            hoverBorderWidth: 3
                        }
                    }
                });
            },
            convertHex(hex, opacity) {
                hex = hex.replace('#', '');
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);

                const result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
                return result;
            }
        },
    }
</script>
