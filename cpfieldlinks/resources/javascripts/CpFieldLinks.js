/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "javascripts/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';
	
	var CpFieldLinks = exports;
	
	if (window.$) $(function () {
	    CpFieldLinks.data = window._CpFieldLinksData || false;
	    CpFieldLinks.init();
	});
	
	CpFieldLinks.settings = {
	    settingsClassSelector: 'cpFieldLinks-settings',
	    infoClassSelector: 'cpFieldLinks-info',
	    redirectKey: '_CpFieldLinksRedirectTo'
	};
	
	CpFieldLinks.init = function () {
	
	    CpFieldLinks.path = Craft.path;
	
	    var redirectTo = Craft.getLocalStorage(CpFieldLinks.settings.redirectKey);
	
	    if (redirectTo) {
	        var $actionInput = $('input[type="hidden"][name="action"]').filter('[value="fields/saveField"],[value="sections/saveEntryType"],[value="globals/saveSet"],[value="categories/saveGroup"]'),
	            $redirectInput = $('input[type="hidden"][name="redirect"]');
	        if ($actionInput.length > 0 && $redirectInput.length > 0) {
	            $redirectInput.attr('value', redirectTo);
	        }
	    }
	
	    Craft.setLocalStorage(CpFieldLinks.settings.redirectKey, null);
	
	    $(document).on('click', '.' + CpFieldLinks.settings.settingsClassSelector + ' a', CpFieldLinks.onCpFieldLinksClick).ajaxComplete(CpFieldLinks.onAjaxComplete);
	
	    this.render();
	};
	
	CpFieldLinks.render = function () {
	
	    CpFieldLinks.fieldIds = [];
	
	    $('.cpFieldLinks').remove();
	
	    var $fields = $('#main .field');
	
	    var fieldData = this.data.fields || {},
	        $field,
	        fieldId;
	    $fields.each(function () {
	        $field = $(this);
	        fieldId = CpFieldLinks.getFieldIdFromAttribute($field.attr('id'));
	        if (fieldId && fieldData.hasOwnProperty(fieldId)) {
	            $field.find('.heading:first label').after(CpFieldLinks.templates.editFieldBtn(fieldData[fieldId]));
	            CpFieldLinks.fieldIds.push($field.attr('id'));
	        }
	    });
	
	    // Add edit source button
	    var $elementSourceIdInputs = $('input[type="hidden"]').filter('[name="entryTypeId"],[name="sectionId"],[name="setId"],[name="groupId"]'),
	        elementSources = {},
	        elementSourceEditLink = false,
	        elementSourceEditType;
	
	    $elementSourceIdInputs.each(function () {
	        elementSources[$(this).attr('name')] = $(this).attr('value');
	    });
	
	    if (elementSources.hasOwnProperty('sectionId')) {
	        elementSourceEditLink = CpFieldLinks.data.baseEditEntryTypeUrl.replace('sectionId', elementSources.sectionId);
	        elementSourceEditType = Craft.t('Entry Type');
	        var typeId = $('#entryType').val() || false;
	        elementSourceEditLink += '/' + (typeId ? typeId : CpFieldLinks.data.entryTypeIds.hasOwnProperty(elementSources.sectionId) ? CpFieldLinks.data.entryTypeIds[elementSources.sectionId][0] : '');
	    } else if (elementSources.hasOwnProperty('setId') && $('input[type="hidden"][name="action"][value="globals/saveSet"]').length === 0) {
	        elementSourceEditLink = CpFieldLinks.data.baseEditGlobalSetUrl + '/' + elementSources.setId;
	        elementSourceEditType = Craft.t('Global Set');
	    } else if (elementSources.hasOwnProperty('groupId') && $('input[type="hidden"][name="action"][value="categories/saveCategory"]').length > 0) {
	        elementSourceEditLink = CpFieldLinks.data.baseEditCategoryGroupUrl + '/' + elementSources.groupId;
	        elementSourceEditType = Craft.t('Category Group');
	    }
	
	    if (elementSourceEditLink) {
	        var $editSourceButton = $(CpFieldLinks.templates.editSourceBtn(elementSourceEditLink, elementSourceEditType));
	        switch (elementSourceEditType) {
	            case Craft.t('Global Set'):
	                $editSourceButton.appendTo($('#content'));
	                break;
	
	            case Craft.t('Entry Type'):case Craft.t('Category Group'):
	                $('#fields').append($editSourceButton);
	                break;
	
	            default:
	                $editSourceButton.appendTo($('#main'));
	        }
	    }
	};
	
	CpFieldLinks.getFieldIdFromAttribute = function (value) {
	    if (!value) return false;
	    value = value.split('-');
	    if (value.length === 3) return value[1];
	    return false;
	};
	
	CpFieldLinks.templates = {
	    editFieldBtn: function editFieldBtn(attributes) {
	        return '<div class="cpFieldLinks cpFieldLinks-fieldEdit">' + '<div class="' + CpFieldLinks.settings.settingsClassSelector + '">' + '<a href="' + CpFieldLinks.data.baseEditFieldUrl + '/' + attributes.id + '" class="settings icon" role="button" aria-label="Edit field"></a>' + '</div>' + '<div class="' + CpFieldLinks.settings.infoClassSelector + '">' + '<p><code>' + attributes.handle + '</code></p></div>' + '</div>';
	    },
	    editSourceBtn: function editSourceBtn(href, type) {
	        return '<div class="cpFieldLinks cpFieldLinks-sourceEdit">' + '<div class="cpFieldLinks-wrapper">' + '<div class="' + CpFieldLinks.settings.settingsClassSelector + '">' + '<a href="' + href + '" class="settings icon" role="button" aria-label="Edit ' + (type || 'element source') + '"></a>' + '</div>' + '<div class="' + CpFieldLinks.settings.infoClassSelector + '">' + '<p><span>Edit ' + (type || 'element source') + '</span></p></div>' + '</div>' + '</div>';
	    }
	};
	
	CpFieldLinks.onCpFieldLinksClick = function (e) {
	    Craft.setLocalStorage(CpFieldLinks.settings.redirectKey, Craft.path);
	};
	
	CpFieldLinks.onAjaxComplete = function (e, status, requestData) {
	    if (requestData.url.indexOf('switchEntryType') > -1 || Craft.path !== CpFieldLinks.path) CpFieldLinks.render();
	};

/***/ }
/******/ ]);
//# sourceMappingURL=CpFieldLinks.js.map