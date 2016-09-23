<?php namespace Craft;

class CpFieldLinksPlugin extends BasePlugin
{

    protected   $_version = '1.2.2',
                $_schemaVersion = '1.0',
                $_minVersion = '2.3',
                $_pluginName = 'CP Field Links',
                $_pluginUrl = 'https://github.com/mmikkel/CpFieldLinks-Craft',
                $_developer = 'Mats Mikkel Rummelhoff',
                $_developerUrl = 'http://mmikkel.no',
                $_description = 'Inspect field handles and easily edit field settings',
                $_releaseFeedUrl = 'https://raw.githubusercontent.com/mmikkel/CpFieldLinks-Craft/master/releases.json',
                $_documentationUrl = 'https://github.com/mmikkel/CpFieldLinks-Craft/blob/master/README.md';

    public function getName()
    {
        return $this->_pluginName;
    }

    public function getVersion()
    {
        return $this->_version;
    }

    public function getSchemaVersion()
    {
        return $this->_schemaVersion;
    }

    public function getDeveloper()
    {
        return $this->_developer;
    }

    public function getDeveloperUrl()
    {
        return $this->_developerUrl;
    }

    public function getPluginUrl()
    {
        return $this->_pluginUrl;
    }

    public function getReleaseFeedUrl()
    {
        return $this->_releaseFeedUrl;
    }

    public function getDescription()
    {
        return $this->_description;
    }

    public function getDocumentationUrl()
    {
        return $this->_documentationUrl;
    }

    public function init()
    {
        parent::init();

        $request = craft()->request;
        $currentUser = craft()->userSession->getUser();

        if (!$currentUser || !$currentUser->admin || !$request->isCpRequest() || craft()->isConsole() || !$this->isCraftRequiredVersion()) {
            return false;
        }

        if (craft()->request->isAjaxRequest()) {
            $this->ajaxInit();
        } else {
            $this->addResources();
        }

    }

    protected function isCraftRequiredVersion()
    {
        return version_compare(craft()->getVersion(), $this->_minVersion, '>=');
    }

    protected function ajaxInit()
    {

        if (!craft()->request->isPostRequest()) {
            return false;
        }

        $segments = craft()->request->segments;
        $actionSegment = $segments[count($segments) - 1];

        if ($actionSegment !== 'getEditorHtml') {
            return false;
        }

        craft()->templates->includeJs('Craft.CpFieldLinksPlugin.initElementEditor();');

    }

    protected function addResources()
    {

        // Get revision manifest
        $manifestPath = dirname(__FILE__) . '/resources/rev-manifest.json';
        $manifest = (file_exists($manifestPath) && $manifest = file_get_contents($manifestPath)) ? json_decode($manifest) : false;

        // Get data
        $data = array(
            'fields' => array(),
            'entryTypeIds' => array(),
            'baseEditFieldUrl' => rtrim(UrlHelper::getCpUrl('settings/fields/edit'), '/'),
            'baseEditEntryTypeUrl' => rtrim(UrlHelper::getCpUrl('settings/sections/sectionId/entrytypes'), '/'),
            'baseEditGlobalSetUrl' => rtrim(UrlHelper::getCpUrl('settings/globals'), '/'),
            'baseEditCategoryGroupUrl' => rtrim(UrlHelper::getCpUrl('settings/categories'), '/'),
            'baseEditCommerceProductTypeUrl' => rtrim(UrlHelper::getCpUrl('commerce/settings/producttypes'), '/'),
        );

        $sectionIds = craft()->sections->allSectionIds;
        foreach ($sectionIds as $sectionId)
        {
            $entryTypes = craft()->sections->getEntryTypesBySectionId($sectionId);
            $data['entryTypeIds']['' . $sectionId] = array();
            foreach ($entryTypes as $entryType)
            {
                $data['entryTypeIds']['' . $sectionId][] = $entryType->id;
            }
        }

        $fields = craft()->fields->allFields;

        foreach ($fields as $field)
        {
            $data['fields'][$field->handle] = array(
                'id' => $field->id,
                'handle' => $field->handle,
                'type' => $field->type,
            );
        }

        // Include resources
        $cssFile = 'stylesheets/CpFieldLinks.css';
        $jsFile = 'javascripts/CpFieldLinks.js';

        craft()->templates->includeCssResource('cpfieldlinks/' . ($manifest ? $manifest->$cssFile : $cssFile));
        craft()->templates->includeJsResource('cpfieldlinks/' . ($manifest ? $manifest->$jsFile : $jsFile));
        craft()->templates->includeJs('Craft.CpFieldLinksPlugin.init('.json_encode($data).');');

    }

}
