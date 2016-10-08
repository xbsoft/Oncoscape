(function() {
    'use strict';

    angular
        .module('oncoscape')
        .directive('osHeatmap', heatmap);

    /** @ngInject */
    function heatmap() {

        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/heatmap/heatmap.html',
            controller: HeatmapController,
            controllerAs: 'vm',
            bindToController: true
        };

        return directive;

        /** @ngInject */
        function HeatmapController(d3, osApi, osCohortService, $state, $timeout, $scope, $stateParams, $window, ocpu) {

            var vm = this;
            vm.datasource = osApi.getDataSource();

            var elChart = $("#heatmap-chart");
            var data;

            osApi.setBusy(true);
            osApi.query("brca_psi_bradleylab_miso", {
                '$limit': 200
            }).then(function(response) {
                data = response;
                    data = response.data;
                var dataCondensed = data.map(function(v){ 
                    return Object.keys(v.patients).map(function(key){
                        console.log("What to do with nulls?")
                        var val = this[key];
                        return (val==null) ? 0 : val;
                    }, v.patients);
                });
                
                osApi.getCpuApi().getHeatmap(
                    {output:"svg",width:10,height:10,data:{"data":dataCondensed}}
                ).then(function(v){ 
                    debugger;
                    var svg = v.documentElement;
                    // svg.attributes['width'] = '100%';
                    // svg.attributes['height'] = '100%';
                    var elSvg = $(svg);
                    elSvg.css("width","100%").css("height","100%")
                    elChart.append(svg);

                    var osLayout = osApi.getLayout();
                    elChart.css("margin-left", (osLayout.left) + "px");
                    elChart.css("width", ($window.innerWidth - osLayout.left - osLayout.right) + "px");
                    elChart.css("height", ($window.innerHeight - 170) + "px");
                    osApi.setBusy(false);
                });
            });

        }
    }
})();