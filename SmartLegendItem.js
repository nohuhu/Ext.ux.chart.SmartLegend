/*
    Legend item that supports explicit item titles as well as other improvements.

    Version 0.9.
    
    Copyright (C) 2011 Alexander Tokarev.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
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
     * @private Places Legend item sprites so that they take minimal space
     * without sacrificing sexy looks.
     */
     updatePosition: function(relativeTo) {
        var me = this,
            items = me.items,
            series = me.series,
            seriesType = series.type,
            marker,
            bbox, fontHeight, halfFontHeight, textOffset, itemHeight;
        
        if ( !relativeTo ) {
            relativeTo = me.legend;
        };
        
        // Calculate font height first, item's dimensions are based on it
        textBBox       = me.label.getBBox();
        fontHeight     = textBBox.height;
        halfFontHeight = Ext.util.Format.round(fontHeight / 2, 0);
        
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
        textOffset = markerBBox.x + markerBBox.width + me.legend.padding;
        
        // Mask sprite height equals overall Item height and it's set
        // approximately twice font height to give Items some breathing space
        me.mask.setAttributes({
            height: fontHeight * 2
        }, false);
        
        // Now go over items and adjust their positions and dimensions
        for ( var i = 0, l = items.length; i < l; i++ ) {
            var item = items[i];
            
            switch ( item.type ) {
            case 'text':
                item.setAttributes({
                    x: textOffset + relativeTo.x + me.x,
                    y: relativeTo.y + me.y
                }, true);
                break;
            case 'rect':
                item.setAttributes({
                    translate: {
                        x: relativeTo.x + me.x,
                        y: relativeTo.y + me.y - halfFontHeight
                    }
                }, true);
                break;
            default:
                item.setAttributes({
                    translate: {
                        x: relativeTo.x + me.x,
                        y: relativeTo.y + me.y
                    }
                }, true);
            };
        };
     }
});