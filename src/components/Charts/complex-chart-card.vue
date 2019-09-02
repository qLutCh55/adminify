<template>
    <v-card color="white">
        <v-card-title v-if="title">
            <h3 class="headline">{{ title }}</h3>
        </v-card-title>
        <v-card-text style="min-height: 300px;">
            <multi-chart
                :labels="chartInfo.labels"
                :statData="chartInfo.datasets"
                :colors="colors"
                :metrics="chartMetrics"
                class="chart-wrapper"
                style="height:300px;"
                height="300"
            ></multi-chart>
        </v-card-text>
    </v-card>
</template>
<script>
    import MultiChart from './Multichart'

    export default {
        inheritAttrs: false,

        name: 'Complex-Chart-Card',

        components: {
            MultiChart
        },

        props: {
            'data': {
                type: Object,
                required: true,
            },
            'metrics': {
                type: Array,
                default: () => ([])
            },
            'colors': {
                type: Array,
                default: () => (['#2196f3', '#4caf50', '#fb8c00', '#ff5252', '#9c27b0'])
            },
            'title': {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                chartInfo: {
                    labels: [],
                    datasets: [],
                },
                chartMetrics: [],
            }
        },

        created() {
            this.chartInfo.labels = this.data.labels;
            this.chartInfo.datasets = this.data.datasets;
            if (!this.metrics.length) {
                this.chartMetrics = Object.keys(this.data.datasets);
            } else {
                this.chartMetrics = this.metrics;
            }
            this.chartIncrease = this.data.increase;
            this.chartPercentage = this.data.percentage;
        }
    }
</script>
