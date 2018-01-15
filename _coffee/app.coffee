'use strict'

reminderApp = angular.module('reminderApp', [
  'ngRoute'
  'ngResource'
  'ui.mask'
])

### Config ###
reminderApp.config [
  '$routeProvider'
  ($routeProvide) ->
    $routeProvide.when('/',
      templateUrl: 'home.html'
      controller: 'RemindersListCtrl').when('/create',
      templateUrl: 'create.html'
      controller: 'RemindersCreateCtrl').when('/edit/:remindersId',
      templateUrl: 'edit.html'
      controller: 'RemindersEditCtrl').otherwise redirectTo: '/'
    return
]

### Factory ###
reminderApp.factory 'Reminder', [
  '$resource'
  ($resource) ->
    $resource 'data/:reminderId.json', { reminderId: 'reminders' }, {}
]

reminderApp.factory 'Storage', [
  'Reminder'
  (Reminder) ->
    {
      query: (id) ->
        array = JSON.parse(localStorage.getItem('reminders'))
        i = 0
        while i < array.length
          if `array[i].id == id`
            return array[i]
            i = array.length
          i++
        return
      get: ->
        if !localStorage.getItem('reminders')
          return Reminder.query({ reminderId: 'reminders' }, (data) ->
            localStorage.setItem 'reminders', JSON.stringify(data.map((item) ->
              item.toJSON()
            ))
            JSON.parse localStorage.getItem('reminders')
          )
        JSON.parse localStorage.getItem('reminders')
      add: (obj) ->
        array = JSON.parse(localStorage.getItem('reminders'))
        obj.id = 'id_' + array.length
        array.push obj
        localStorage.setItem 'reminders', JSON.stringify(array)
        return
      edit: (id, obj) ->
        array = JSON.parse(localStorage.getItem('reminders'))
        i = 0
        while i < array.length
          if `array[i].id == id`
            array[i] = obj
            array[i].id = id
            i = array.length
          i++
        localStorage.setItem 'reminders', JSON.stringify(array)
        return

    }
]

### Filter ###
reminderApp.filter 'descriptionFilter', ->
  (arr = [], search = '') ->
    arr.filter (item) ->
      item.description.toLowerCase().indexOf(search.toLowerCase()) + 1

### Controller ###
reminderApp.controller 'appCtrl', [
  '$rootScope'
  '$scope'
  '$http'
  '$location'
  'Storage'
  '$routeParams'
  ($rootScope, $scope, $http, $location, Storage, $routeParams) ->
    $rootScope.$on '$routeChangeSuccess', ->
      $scope.reminders = Storage.get()
      #$routeParams.remindersId
      switch $location.$$url
        when '/'
          $scope.crumbsArray = [ {
            name: 'reminder'
            link: '#/'
          } ]
          $scope.noEdit = false
        when '/edit/' + $routeParams.remindersId
          $scope.crumbsArray = [
            {
              name: 'reminder'
              link: '#/'
            }
            {
              name: $routeParams.remindersId
              link: '#/edit/' + $routeParams.remindersId
            }
          ]
          $scope.noEdit = true
        when '/create'
          $scope.crumbsArray = [
            {
              name: 'reminder'
              link: '#/'
            }
            {
              name: 'create'
              link: '#/create'
            }
          ]
          $scope.noEdit = false
        else
          break
      return
    return
]

reminderApp.controller 'RemindersListCtrl', [
  '$scope'
  '$http'
  '$location'
  'Storage'
  ($scope, $http, $location, Storage) ->
    $scope.showModal = false
    selectedItem = undefined

    $scope.setImage = (item) ->
      selectedItem = item
      $scope.modalImgUrl = selectedItem.imageUrl
      $scope.inputImgUrl = ''
      $scope.showModal = true
      return

    $scope.updateImg = ->
      selectedItem.imageUrl = $scope.inputImgUrl
      $scope.modalImgUrl = $scope.inputImgUrl
      Storage.edit selectedItem.id, selectedItem
      return

    $scope.show = (item) ->
      $scope.largeImgUrl = item
      return

    return
]

reminderApp.controller 'RemindersCreateCtrl', [
  '$scope'
  '$http'
  '$location'
  'Storage'
  ($scope, $http, $location, Storage) ->
    $scope.item = {}
    $scope.item.imageUrl = 'img/empty.png'
    $scope.item.mail = ''
    $scope.item.phone = ''
    $scope.item.date = ''
    $scope.item.description = ''
    $scope.item.status = true

    $scope.setImage = ->
      $scope.modalImgUrl = $scope.item.imageUrl
      $scope.inputImgUrl = ''
      $scope.showModal = true
      return

    $scope.updateImg = ->
      $scope.item.imageUrl = $scope.inputImgUrl
      $scope.modalImgUrl = $scope.inputImgUrl
      return

    $scope.create = ->
      if $scope.reminderForm.$valid
        Storage.add $scope.item
        $location.path '/'
      return

    return
]

reminderApp.controller 'RemindersEditCtrl', [
  '$scope'
  '$http'
  '$location'
  '$routeParams'
  'Storage'
  ($scope, $http, $location, $routeParams, Storage) ->
    id = $routeParams.remindersId
    $scope.item = Storage.query(id)
    $scope.date = new Date($scope.item.date)

    $scope.setImage = ->
      $scope.modalImgUrl = $scope.item.imageUrl
      $scope.inputImgUrl = ''
      $scope.showModal = true
      return

    $scope.updateImg = ->
      $scope.item.imageUrl = $scope.inputImgUrl
      $scope.modalImgUrl = $scope.inputImgUrl
      return

    $scope.update = ->
      if $scope.reminderForm.$valid
        $scope.item.date = $scope.date
        Storage.edit $scope.item.id, $scope.item
        $location.path '/'
      return

    return
]