/*
 * Legend item that supports explicit item titles as well as other improvements.
 *
 * Version 0.99, compatible with Ext JS 4.1
 *  
 * Copyright (c) 2011-2012 Alexander Tokarev.
 *
 * This code is licensed under the terms of the Open Source LGPL 3.0 license.
 * Commercial use is permitted to the extent that the code/component(s) do NOT
 * become part of another Open Source or Commercially licensed development library
 * or toolkit without explicit permission.
 * 
 * License details: http://www.gnu.org/licenses/lgpl.html
 */

Ext.define('Ext.ux.chart.SmartLegendItem', {
    extend: 'Ext.ux.chart.LegendItem',
    
    requires: [ 'Ext.util.Format' ],
    
    /**
     * @private Retrieves text to be displayed as item label.
     * Looks for explicit Series field title first, then uses default locations.
     */
    getLabelText: function() {
        var me = this,
            series = me.series,
            idx = me.yFieldIndex;
        
        return (series && series.yFieldTitle && series.yFieldTitle[idx]) ||
               me.callParent(arguments);
    },
    
    /**
     * @private Creates Series marker Sprites.
     */
    createSeriesMarkers: function(config) {
        var me = this,
            index = config.yFieldIndex,
            series = me.series,
            seriesType = me.seriesType || series.type,
            surface = me.surface,
            z = me.zIndex;

        // Line series - display as short line with optional marker in the middle
        if (seriesType === 'line' || seriesType === 'scatter') {
            if(seriesType === 'line') {
                var seriesStyle = Ext.apply(series.seriesStyle, series.style);
                me.drawLine(0.5, 0.5, 16.5, 0.5, z, seriesStyle, index);
            };
            
            if (series.showMarkers || seriesType === 'scatter') {
                var markerConfig = Ext.apply(series.markerStyle, series.markerConfig || {}, {
                    fill: series.getLegendColor(index)
                });
                me.drawMarker(8.5, 0.5, z, markerConfig);
            }
        }
        // All other series types - display as filled box
        else {
            me.drawFilledBox(12, 12, z, index);
        }
    },
    
    /**
     * @private Places Legend item sprites so that they take minimal space
     * without sacrificing sexy looks.
     */
     updatePosition: function(relativeTo) {
        var me = this,
            items = me.items,
            seriesType = me.seriesType || me.series.type,
            mfloor = Math.floor,
            marker, markerBBox, textBBox,
            bbox, fontHeight, halfFontHeight, textOffset, itemHeight, attr;
        
        if ( !relativeTo ) {
            relativeTo = me.legend;
        };
        
        // Calculate font height first, item's dimensions are based on it
        bbox           = me.getBBox();
        textBBox       = me.label.getBBox();
        fontHeight     = textBBox.height;
        halfFontHeight = mfloor(fontHeight / 2);
        
        // For other Series than Line and Scatter, marker sprite is a color filled box.
        // Its dimensions should match text font size.
        if ( marker = me.get('box') ) {
            marker.setAttributes({
                    width:  fontHeight,
                    height: fontHeight
            }, true);
        };
        
        // Text sprite offset depends on marker sprite width
        markerBBox = seriesType == 'line'    ? me.get('line').getBBox()
                   : seriesType == 'scatter' ? me.get('marker').getBBox()
                   :                           marker.getBBox() || me.get('box').getBBox()
                   ;
        
        // Now go over items and adjust their positions and dimensions
        for ( var i = 0, l = items.length; i < l; i++ ) {
            var item = items[i];
            
            switch ( item.type ) {
            case 'text':
                attr = {
                    x: mfloor(relativeTo.x + me.x + markerBBox.width + me.legend.padding),
                    y: mfloor(relativeTo.y + me.y + (bbox.height - fontHeight - 1) / 2)
                };
                
                item.setAttributes(attr, true);
                break;
            case 'rect':
                if ( Ext.isIE6 || Ext.isIE7 || Ext.isIE8 ) {
                    attr = {
                        translate: {
                            x: mfloor(relativeTo.x + me.x),
                            y: mfloor(relativeTo.y + me.y - (bbox.height - fontHeight + 2) / 2)
                        }
                    };
                }
                else if ( Ext.isIE ) {
                    attr = {
                        x: mfloor(relativeTo.x + me.x),
                        y: mfloor(relativeTo.y + me.y - (bbox.height - fontHeight) / 2)
                    };
                }
                else {
                    attr = {
                        x: mfloor(relativeTo.x + me.x),
                        y: mfloor(relativeTo.y + me.y - (bbox.height - fontHeight + 2) / 2)
                    };
                };
                
                item.setAttributes(attr, true);
                break;
            default:
                attr = {
                    translate: {
                        x: mfloor(relativeTo.x + me.x),
                        y: mfloor(relativeTo.y + me.y + (bbox.height - fontHeight - 2) / 2)
                    }
                };
                
                item.setAttributes(attr, true);
            };
        };
     }
});