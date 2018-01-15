'use strict';
var reminderApp;

reminderApp = angular.module('reminderApp', ['ngRoute', 'ngResource', 'ui.mask']);


/* Config */

reminderApp.config([
  '$routeProvider', function($routeProvide) {
    $routeProvide.when('/', {
      templateUrl: 'home.html',
      controller: 'RemindersListCtrl'
    }).when('/create', {
      templateUrl: 'create.html',
      controller: 'RemindersCreateCtrl'
    }).when('/edit/:remindersId', {
      templateUrl: 'edit.html',
      controller: 'RemindersEditCtrl'
    }).otherwise({
      redirectTo: '/'
    });
  }
]);


/* Factory */

reminderApp.factory('Reminder', [
  '$resource', function($resource) {
    return $resource('data/:reminderId.json', {
      reminderId: 'reminders'
    }, {});
  }
]);

reminderApp.factory('Storage', [
  'Reminder', function(Reminder) {
    return {
      query: function(id) {
        var array, i;
        array = JSON.parse(localStorage.getItem('reminders'));
        i = 0;
        while (i < array.length) {
          if (array[i].id == id) {
            return array[i];
            i = array.length;
          }
          i++;
        }
      },
      get: function() {
        if (!localStorage.getItem('reminders')) {
          return Reminder.query({
            reminderId: 'reminders'
          }, function(data) {
            localStorage.setItem('reminders', JSON.stringify(data.map(function(item) {
              return item.toJSON();
            })));
            return JSON.parse(localStorage.getItem('reminders'));
          });
        }
        return JSON.parse(localStorage.getItem('reminders'));
      },
      add: function(obj) {
        var array;
        array = JSON.parse(localStorage.getItem('reminders'));
        obj.id = 'id_' + array.length;
        array.push(obj);
        localStorage.setItem('reminders', JSON.stringify(array));
      },
      edit: function(id, obj) {
        var array, i;
        array = JSON.parse(localStorage.getItem('reminders'));
        i = 0;
        while (i < array.length) {
          if (array[i].id == id) {
            array[i] = obj;
            array[i].id = id;
            i = array.length;
          }
          i++;
        }
        localStorage.setItem('reminders', JSON.stringify(array));
      }
    };
  }
]);


/* Filter */

reminderApp.filter('descriptionFilter', function() {
  return function(arr, search) {
    if (arr == null) {
      arr = [];
    }
    if (search == null) {
      search = '';
    }
    return arr.filter(function(item) {
      return item.description.toLowerCase().indexOf(search.toLowerCase()) + 1;
    });
  };
});


/* Controller */

reminderApp.controller('appCtrl', [
  '$rootScope', '$scope', '$http', '$location', 'Storage', '$routeParams', function($rootScope, $scope, $http, $location, Storage, $routeParams) {
    $rootScope.$on('$routeChangeSuccess', function() {
      $scope.reminders = Storage.get();
      switch ($location.$$url) {
        case '/':
          $scope.crumbsArray = [
            {
              name: 'reminder',
              link: '#/'
            }
          ];
          $scope.noEdit = false;
          break;
        case '/edit/' + $routeParams.remindersId:
          $scope.crumbsArray = [
            {
              name: 'reminder',
              link: '#/'
            }, {
              name: $routeParams.remindersId,
              link: '#/edit/' + $routeParams.remindersId
            }
          ];
          $scope.noEdit = true;
          break;
        case '/create':
          $scope.crumbsArray = [
            {
              name: 'reminder',
              link: '#/'
            }, {
              name: 'create',
              link: '#/create'
            }
          ];
          $scope.noEdit = false;
          break;
        default:
          break;
      }
    });
  }
]);

reminderApp.controller('RemindersListCtrl', [
  '$scope', '$http', '$location', 'Storage', function($scope, $http, $location, Storage) {
    var selectedItem;
    $scope.showModal = false;
    selectedItem = void 0;
    $scope.setImage = function(item) {
      selectedItem = item;
      $scope.modalImgUrl = selectedItem.imageUrl;
      $scope.inputImgUrl = '';
      $scope.showModal = true;
    };
    $scope.updateImg = function() {
      selectedItem.imageUrl = $scope.inputImgUrl;
      $scope.modalImgUrl = $scope.inputImgUrl;
      Storage.edit(selectedItem.id, selectedItem);
    };
    $scope.show = function(item) {
      $scope.largeImgUrl = item;
    };
  }
]);

reminderApp.controller('RemindersCreateCtrl', [
  '$scope', '$http', '$location', 'Storage', function($scope, $http, $location, Storage) {
    $scope.item = {};
    $scope.item.imageUrl = 'img/empty.png';
    $scope.item.mail = '';
    $scope.item.phone = '';
    $scope.item.date = '';
    $scope.item.description = '';
    $scope.item.status = true;
    $scope.setImage = function() {
      $scope.modalImgUrl = $scope.item.imageUrl;
      $scope.inputImgUrl = '';
      $scope.showModal = true;
    };
    $scope.updateImg = function() {
      $scope.item.imageUrl = $scope.inputImgUrl;
      $scope.modalImgUrl = $scope.inputImgUrl;
    };
    $scope.create = function() {
      if ($scope.reminderForm.$valid) {
        Storage.add($scope.item);
        $location.path('/');
      }
    };
  }
]);

reminderApp.controller('RemindersEditCtrl', [
  '$scope', '$http', '$location', '$routeParams', 'Storage', function($scope, $http, $location, $routeParams, Storage) {
    var id;
    id = $routeParams.remindersId;
    $scope.item = Storage.query(id);
    $scope.date = new Date($scope.item.date);
    $scope.setImage = function() {
      $scope.modalImgUrl = $scope.item.imageUrl;
      $scope.inputImgUrl = '';
      $scope.showModal = true;
    };
    $scope.updateImg = function() {
      $scope.item.imageUrl = $scope.inputImgUrl;
      $scope.modalImgUrl = $scope.inputImgUrl;
    };
    $scope.update = function() {
      if ($scope.reminderForm.$valid) {
        $scope.item.date = $scope.date;
        Storage.edit($scope.item.id, $scope.item);
        $location.path('/');
      }
    };
  }
]);
