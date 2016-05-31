(function() {
    'use strict';

    angular
        .module('oncoscape')
        .directive('osDataExplorer', explore);

    /** @ngInject */
    function explore() {

        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/dataexplorer/dataexplorer.html',
            controller: DataExplorerController,
            controllerAs: 'vm',
            bindToController: true
        };

        return directive;

        /** @ngInject */
        function DataExplorerController(osApi, $state, $timeout, $scope, $stateParams, _) {

            if (angular.isUndefined($stateParams.datasource)){
                $state.go("datasource");
                return;
            }
            // View Model
            var vm = this;
            vm.dataSources;
            vm.dataSource;
            vm.dataDiseases;
            vm.dataDisease;
            vm.dataTables;
            vm.dataTable;
            vm.dataFields;

            vm.toolTipContentFunction = function(){
                return function(key, x, y, e, graph) {
                        return  'Super New Tooltip' +
                        '<h1>' + key + '</h1>' +
                        '<p>' +  y + ' at ' + x + '</p>'
                }
            }

                

            vm.xFunction = function(){
                return function(d) {
                    return d.label;
                };
            }
            
            vm.yFunction = function(){
                return function(d) {
                    return d.value;
                };
            }
          
          // var colorArray = ['#000000', '#660000', '#CC0000', '#FF6666', '#FF3333', '#FF6666', '#FFE6E6'];
          //   vm.colorFunction = function() {
          //       return function(d, i) {
          //           return colorArray[i];
          //       };
          //   }

            // Load Datasets
            osApi.setBusy(true);
            osApi.query("_collections").then(function(result){
                
                // Transform DataSources
                var data = result.data;
                vm.dataSources = 
                _.chain(data).pluck("source").uniq().map(function(v){return { name:v,
                        diseases:_.chain(data).where({source:v}).pluck("disease").uniq().map(function(v){ 
                            return { name:v,
                                tables: _.chain(data).where({source:"tcga",disease:v}).map(function(v){ 
                                    return {created:v.created, name:v.table, records:v.records, collection:v.collection}} ).value()
                            };}).value()
                    };}).value();
                vm.dataSource = vm.dataSources[0];
                
                $scope.$watch("vm.dataSource", function(){
                    vm.dataDiseases = vm.dataSource.diseases;
                    vm.dataDisease = vm.dataSource.diseases[0];

                });
                $scope.$watch("vm.dataDisease", function(){
                    vm.dataTables = vm.dataDisease.tables;
                    vm.dataTable = vm.dataTables[0];
                    
                });
                $scope.$watch("vm.dataTable", function(){
                    osApi.query("_stats", {collection:vm.dataTable.collection}).then(function(result){
                        vm.dataFields = result.data[0].fields;
                    });
                });

               osApi.setBusy(false);
               
            });
            
        }
    }
})();

