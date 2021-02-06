/*
ClickableMapMaker.com - Map creation Javascript library
Copyright (C) 2021  ClickableMapMaker.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/> 
*/

var ClickableMap = {};

(function() { 
    var version = '1.0.0';
    var classPrefix = 'cmm-usa-';
    var creditLinkUrl = 'http://www.clickablemapmaker.com';
    var stateCount = 0;
    var maxTableColumns = 5;
    var global = this;

    // Static public helpers
    this.getEleById = function(id) {
        return document.getElementById(id);
    };
    this.getEleByQuery = function(query) {
        return document.querySelector(query);
    };
    this.stateIdToDomClass = function(stateId) {
        return classPrefix + 'state-' + stateId.toLowerCase();
    }; 
    this.version = version;
    
    // Private helpers
    function createBaseGlobalData() {
        return {
            version: version,
            width: '800',
            widthUnits: 'px',
            fontSize: '12px',
            fontName: 'Arial',
            fill: '#dddddd',
            hoverFill: '#ffffff',
            disabledFill: '#333333',
            backgroundFill: '#eeeeee',
            innerLabelColor: '#0000ff',
            outerLabelColor: '#000000',
            hoverLabelColor: '#ff0000',
            borderType: null,
            borderStroke: '#000000',
            enableShadows: true,
            popLink: false,
            showStateTitleAndDescOnHover: true,
            showLinksList: true,
            globalLinkUrl: null,
            globalJsCallback: null,
            mapTitle: 'Choose your state below',
            creditLink: 'Click here to create your own map at...'
        };
    }

    // States data
    function createBaseStatesData() {
        var statesData = {
            AL: {fullName: 'Alabama'}, AK: {fullName: 'Alaska'}, AZ: {fullName: 'Arizona'}, AR: {fullName: 'Arkansas'}, CA: {fullName: 'California'}, 
            CO: {fullName: 'Colorado'}, CT: {fullName: 'Connecticut'}, DE: {fullName: 'Delaware'}, DC: {fullName: 'District Of Columbia'}, 
            FL: {fullName: 'Florida'}, GA: {fullName: 'Georgia'}, HI: {fullName: 'Hawaii'}, ID: {fullName: 'Idaho'}, IL: {fullName: 'Illinois'}, 
            IN: {fullName: 'Indiana'}, IA: {fullName: 'Iowa'}, KS: {fullName: 'Kansas'}, KY: {fullName: 'Kentucky'}, LA: {fullName: 'Louisiana'}, 
            ME: {fullName: 'Maine'}, MD: {fullName: 'Maryland'}, MA: {fullName: 'Massachusetts'}, MI: {fullName: 'Michigan'}, 
            MN: {fullName: 'Minnesota'}, MS: {fullName: 'Mississippi'}, MO: {fullName: 'Missouri'}, MT: {fullName: 'Montana'}, 
            NE: {fullName: 'Nebraska'}, NV: {fullName: 'Nevada'}, NH: {fullName: 'New Hampshire'}, NJ: {fullName: 'New Jersey'}, 
            NM: {fullName: 'New Mexico'}, NY: {fullName: 'New York'}, NC: {fullName: 'North Carolina'}, ND: {fullName: 'North Dakota'}, 
            OH: {fullName: 'Ohio'}, OK: {fullName: 'Oklahoma'}, OR: {fullName: 'Oregon'}, PA: {fullName: 'Pennsylvania'}, 
            RI: {fullName: 'Rhode Island'}, SC: {fullName: 'South Carolina'}, SD: {fullName: 'South Dakota'}, TN: {fullName: 'Tennessee'}, 
            TX: {fullName: 'Texas'}, UT: {fullName: 'Utah'}, VT: {fullName: 'Vermont'}, VA: {fullName: 'Virginia'}, WA: {fullName: 'Washington'}, 
            WV: {fullName: 'West Virginia'}, WI: {fullName: 'Wisconsin'}, WY: {fullName: 'Wyoming'}
        };
        
        // Setup state extended properties
        for(var stateId in statesData) {
            if(!statesData.hasOwnProperty(stateId)) {
                continue;
            }
            statesData[stateId].title = statesData[stateId].fullName;
            statesData[stateId].description = null;
            statesData[stateId].linkUrl = null;
            statesData[stateId].isDisabled = false;
            statesData[stateId].isHovering = false;
            statesData[stateId].cssClass = null;
            statesData[stateId].overrideFill = null;
            statesData[stateId].overrideFillEnabled = false;
            statesData[stateId].overrideHoverFill = null;
            statesData[stateId].overrideHoverFillEnabled = false;
            statesData[stateId].overridePopLink = null,
            stateCount++;
        }
        return statesData;
    }

    // Hover state event
    function stateOn(stateId) {
        if(this.statesData[stateId].isHovering) {
            return;
        }
        this.statesData[stateId].isHovering = true;
        var $stateLink = global.getEleByQuery('#' + this.$map.id + ' .' + global.stateIdToDomClass(stateId));
        var $statePath = global.getEleByQuery('#' + this.$map.id + ' .' + global.stateIdToDomClass(stateId) + ' path');
        var $stateText = global.getEleByQuery('#' + this.$map.id + ' .' + global.stateIdToDomClass(stateId) + ' text');

        if(this.statesData[stateId].isDisabled) {
            $statePath.style.fill = this.globalData.disabledFill;
            $stateLink.style.cursor = 'default';
        }
        else if(this.statesData[stateId].overrideHoverFillEnabled && this.statesData[stateId].overrideHoverFill != null) {
            $statePath.style.fill = this.statesData[stateId].overrideHoverFill;
            $stateText.style.fill = this.globalData.hoverLabelColor;
            $stateLink.style.cursor = 'pointer';
        }
        else {
            $statePath.style.fill = this.globalData.hoverFill;
            $stateText.style.fill = this.globalData.hoverLabelColor;
            $stateLink.style.cursor = 'pointer';
        }

        // Show current state chosen on mouse over
        if(this.globalData.showStateTitleAndDescOnHover) {
            var $hoverStateInfo = global.getEleByQuery('#' + this.$map.id + ' .' + classPrefix + 'hover-state-info');            
            var titleText = this.statesData[stateId].title == null ? '' : this.statesData[stateId].title;
            var descText = this.statesData[stateId].description == null ? '' : this.statesData[stateId].description;
            $hoverStateInfo.innerHTML = '<span>' + titleText + '</span><span>' + descText + '</span>';
            $hoverStateInfo.style.display = 'block';
        }

        if(!this.statesData[stateId].isDisabled && this.globalData.enableShadows) {
            statePathBlur = $statePath.cloneNode(true);
            statePathBlur.setAttribute('filter', 'url(#' + this.$map.id + '-blur-filter)');
            statePathBlur.setAttribute('class', classPrefix + 'state-shadow');
            $stateLink.parentNode.appendChild(statePathBlur);
            $stateLink.parentNode.appendChild($stateLink);
        }
    }
    
    // Hover off state event
    function stateOff(stateId) {
        this.statesData[stateId].isHovering = false;
        var $statePath = global.getEleByQuery('#' + this.$map.id + ' .' + global.stateIdToDomClass(stateId) + ' path');
        var $stateText = global.getEleByQuery('#' + this.$map.id + ' .' + global.stateIdToDomClass(stateId) + ' text');
        var isOuterLabel = $stateText.getAttribute('class') == classPrefix + 'outer-label';

        // Show current state chosen on mouse over
        if(this.globalData.showStateTitleAndDescOnHover) {
            var $hoverStateInfo = global.getEleByQuery('#' + this.$map.id + ' .' + classPrefix + 'hover-state-info');
            $hoverStateInfo.style.display = 'none';
        }
        
        if(this.statesData[stateId].isDisabled) {
            $statePath.style.fill = this.globalData.disabledFill;
        }
        else if(this.statesData[stateId].overrideFillEnabled && this.statesData[stateId].overrideFill != null) {
            $statePath.style.fill = this.statesData[stateId].overrideFill;
            $stateText.style.fill = isOuterLabel ? this.globalData.outerLabelColor : this.globalData.innerLabelColor;
        }
        else {
            $statePath.style.fill = this.globalData.fill;
            $stateText.style.fill = isOuterLabel ? this.globalData.outerLabelColor : this.globalData.innerLabelColor;
        }

        // Remove shadows
        var allShadows = document.querySelectorAll('#' + this.$map.id + ' .' + classPrefix + 'state-shadow');
        Array.prototype.map.call(
            Array.prototype.slice.call(allShadows),
            function(ele) {
                ele.parentNode.removeChild(ele);
            }
        );
    }

    // Live state links
    function wireStateLink(stateId) {
        var clickFn = null;
        var $stateLink = global.getEleByQuery('#' + this.$map.id + ' .' + global.stateIdToDomClass(stateId));

        // Add css class if needed
        if(this.statesData[stateId].cssClass != null) {
            $stateLink.setAttribute('class', this.statesData[stateId].cssClass);
        }

        // Disabled state
        if(this.statesData[stateId].isDisabled) {
            clickFn = null;
        }
        // State specific URL
        else if(this.statesData[stateId].linkUrl != null) {
            clickFn = function(e) {
                var isPop = false;
                if(this.statesData[stateId].overridePopLink != null) {
                    isPop = this.statesData[stateId].overridePopLink;
                }
                else if(this.globalData.popLink) {
                    isPop = true;
                }
                if(isPop) {
                    window.open(this.statesData[stateId].linkUrl);
                }
                else {
                    document.location.href = this.statesData[stateId].linkUrl;
                }
            };
        }
        // Global link URL
        else if(this.globalData.globalLinkUrl != null) {
            clickFn = function(e) {
                var normalizedUrl = globalData.globalLinkUrl.replaceAll('@state', stateId);
                var isPop = false;
                if(this.statesData[stateId].overridePopLink != null) {
                    isPop = this.statesData[stateId].overridePopLink;
                }
                else if(this.globalData.popLink) {
                    isPop = true;
                }
                if(isPop) {
                    window.open(normalizedUrl);
                }
                else {
                    document.location.href = normalizedUrl;
                }
            };
        }
        // Global Javascript callback
        else if(this.globalData.globalJsCallback != null) {
            clickFn = function(e) {
                var fn = window[globalData.globalJsCallback];
                if(typeof fn == 'function') {
                    fn(stateId);
                }
            };
        }

        $stateLink.onclick = clickFn;
    }

    this.create = function(wrapperId) {
        return new this.mapObject(wrapperId);
    };

    this.mapObject = function(wrapperId) {
        this.$map = global.getEleById(wrapperId);
        this.globalData = createBaseGlobalData();
        this.statesData = createBaseStatesData();
        // Setup state mouseovers
        for(var stateId in this.statesData) {
            if(!this.statesData.hasOwnProperty(stateId)) {
                continue;
            }

            // Set fill if disabled, otherwise, attach mouse handlers
            (function(stateId) {
                var $stateLink = global.getEleByQuery('#' + this.$map.id + ' .' + global.stateIdToDomClass(stateId));
                var self = this;
                $stateLink.addEventListener('mouseover', function(e) {
                    stateOn.call(self, stateId);
                });
                $stateLink.addEventListener('mouseout', function(e) {
                    stateOff.call(self, stateId);
                });
                $stateLink = null;
            }.call(this, stateId));

            // Setup click handlers
            wireStateLink.call(this, stateId);
        }
                
        // Get an ID on the shadow
        global.getEleByQuery('#' + this.$map.id + ' .' + classPrefix + 'blur-filter').setAttribute('id', this.$map.id + '-blur-filter');

        // Update map
        this.draw();
    };

    // Get dom ID
    this.mapObject.prototype.getDomId = function() {
        return this.$map.id;
    };

    // Update map display
    this.mapObject.prototype.draw = function() {
        // Global level properties
        this.$map.style.width = this.globalData.width + this.globalData.widthUnits;
        this.$map.style.backgroundColor = this.globalData.backgroundFill;
        this.$map.style.fontFamily = this.globalData.fontName;
        var $mapSvg = global.getEleByQuery('#' + this.$map.id + ' svg').style.fontSize = this.globalData.fontSize;
        global.getEleByQuery('#' + this.$map.id + ' .' + classPrefix + 'title').textContent = this.globalData.mapTitle;
        if(this.globalData.creditLink != null && this.globalData.creditLink != '') {
            global.getEleByQuery('#' + this.$map.id + ' .' + classPrefix + 'credit-link').innerHTML = '<a target="_blank" href="' + creditLinkUrl + '"></a>';
            global.getEleByQuery('#' + this.$map.id + ' .' + classPrefix + 'credit-link a').textContent = this.globalData.creditLink;
        }
        else {
            global.getEleByQuery('#' + this.$map.id + ' .' + classPrefix + 'credit-link').innerHTML = '';
        }

        // State properties
        for(var stateId in this.statesData) {
            if(!this.statesData.hasOwnProperty(stateId)) {
                continue;
            }
            var stateDomClass = global.stateIdToDomClass(stateId);

            // Update accesibility properties
            var $stateTitle = global.getEleByQuery('#' + this.$map.id + ' .' + stateDomClass + ' title');
            var $stateDescription = global.getEleByQuery('#' + this.$map.id + ' .' + stateDomClass + ' desc');
            $stateTitle.textContent = this.statesData[stateId].title;
            $stateDescription.textContent = this.statesData[stateId].description;

            // Update visual properties
            var $statePath = global.getEleByQuery('#' + this.$map.id + ' .' + stateDomClass + ' path');
            $statePath.style.stroke = this.globalData.borderStroke;

            if(this.globalData.borderType != null) {
                $statePath.style.strokeDasharray = this.globalData.borderType;
            }
            else {
                $statePath.style.strokeDasharray = 'none';
            }

            if(this.statesData[stateId].isDisabled) {
                $statePath.style.fill = this.globalData.disabledFill;
            }
            else if(this.statesData[stateId].overrideFillEnabled && this.statesData[stateId].overrideFill != null) {
                $statePath.style.fill = this.statesData[stateId].overrideFill;
            }
            else {
                $statePath.style.fill = this.globalData.fill;
            }

            var $allLabels = document.querySelectorAll('#' + this.$map.id + ' .' + stateDomClass + ' text');
            for(var i = 0; i < $allLabels.length; ++i) {
                $allLabels.item(i).style.fill = this.globalData.innerLabelColor;
            }
        }

        // State label override for "outer" labels
        var $outerLabels = document.querySelectorAll('#' + this.$map.id + ' .' + classPrefix + 'outer-label');
        for(var i = 0; i < $outerLabels.length; ++i) {
            $outerLabels.item(i).style.fill = this.globalData.outerLabelColor;
        }

        // Display the map
        this.$map.style.display = 'block';
    };

    // Get global data
    this.mapObject.prototype.getGlobalData = function() {
        return this.globalData;
    };

    // Get states data
    this.mapObject.prototype.getStatesData = function() {
        return this.statesData;
    };

    // Set global data
    this.mapObject.prototype.setGlobalData = function(data) {
        for(var setting in this.globalData) {
            if(!this.globalData.hasOwnProperty(setting) || !data.hasOwnProperty(setting)) {
                continue;
            }
            this.globalData[setting] = data[setting];
        }
    };

     // Set states data
    this.mapObject.prototype.setStatesData = function(data) {
        for(var setting in this.statesData) {
            if(!this.statesData.hasOwnProperty(setting) || !data.hasOwnProperty(setting)) {
                continue;
            }
            this.statesData[setting] = data[setting];
        }
    };

    // Build table for state links list
    this.mapObject.prototype.displayMapLinksList = function() {
        var $linkLists = global.getEleById(classPrefix + 'link-list');
        var allListsHtml = '';
        var stateIds = [];
        for(var stateId in this.statesData) {
            if(!this.statesData.hasOwnProperty(stateId)) {
                continue;
            }
            stateIds.push(stateId);
        }
        var widthPercent = Math.floor(100 / maxTableColumns);
        var itemsPerList = Math.ceil(stateCount / maxTableColumns);
        var sliceStart = 0;
        for(var i = 0; i < maxTableColumns; ++i) {
            var slicedIds = stateIds.slice(sliceStart, sliceStart + itemsPerList);
            sliceStart += itemsPerList;
            if(slicedIds.length > 0) {
                var listHtml = '<ul style="width:' + widthPercent + '%;">';
                for(var x = 0; x < slicedIds.length; ++x) {
                    listHtml += '<li><span></span>';
                    listHtml += '<a id="' + classPrefix + 'state-' + slicedIds[x].toLowerCase() + '-listview">';
                    listHtml += this.statesData[slicedIds[x]].title;
                    listHtml += '</a></li>';
                }
                listHtml += '</ul>';
                allListsHtml += listHtml;
            }
        }
        $linkLists.innerHTML = allListsHtml;

        // Calculate the links for states
        for(var stateId in this.statesData) {
            if(!this.statesData.hasOwnProperty(stateId)) {
                continue;
            }
            createLiveStateLink(stateId, '-listview');
        }
    };
}).apply(ClickableMap);