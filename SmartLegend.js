/*
    Smart chart Legend: it tries hard to fit available Chart dimensions
    without hogging all the space. Will rearrange itself in columns or rows.
    
    Uses Smart legend item to provide explicit Series field titles, too.

    Version 0.9.
    
    Copyright (C) 2011 Alexander Tokarev.
    
    Usage: drop-in replacement for Ext.chart.Legend. See demo application
    for more details.

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

Ext.define('Ext.ux.chart.SmartLegend', {
    extend: 'Ext.ux.chart.Legend',
    
    requires: [ 'Ext.ux.chart.SmartLegendItem' ],
    
    /**
     * @private Create all the sprites for the legend
     */
    create: function() {
        var me = this;
        
        // Avoid re-creation when Legend is invisible
        if ( !me.created || me.isDisplayed() ) {
            me.createBox();
            me.createItems();
        };
        
        if (!me.created && me.isDisplayed()) {
            me.created = true;

            // Listen for changes to series titles to trigger regeneration of the legend
            me.chart.series.each(function(series) {
                series.on('titlechange', me.redraw, me);
            });
        }
    },
    
    /**
     * @private Creates single Legend Item.
     */
    createLegendItem: function(series, yFieldIndex) {
        var me = this;
        
        return Ext.create('Ext.ux.chart.SmartLegendItem', {
            legend:      me,
            series:      series,
            surface:     me.chart.surface,
            yFieldIndex: yFieldIndex
        });
    },
    
    /**
     * @private Works around missing getInsets in Ext.chart.Chart
     */
    getChartInsets: function() {
        var me = this,
            chart = me.chart,
            ip = chart.insetPadding;
        
        return chart.getInsets ? chart.getInsets()
             :                   { left: ip, top: ip, right: ip, bottom: ip }
             ;
    },
    
    /**
     * @private Calculates Legend position with respect to Chart elements.
     */
    calcPosition: function() {
        var me = this,
            chartBBox = me.chart.chartBBox,
            surface = me.chart.surface,
            mfloor = Math.floor,
            x, y;
        
        // Support for refactored Chart
        insets = me.getChartInsets();

        // Find position based on dimensions
        // Take into account that insets can be different on sides
        switch ( me.position ) {
        case 'left':
            x = insets.left;
            y = mfloor(insets.top + chartBBox.height / 2 - me.height / 2);
            break;
        case 'right':
            x = mfloor(surface.width - me.width) - insets.right;
            y = insets.top + mfloor(chartBBox.height / 2 - me.height / 2);
            break;
        case 'top':
            x = mfloor(insets.left + chartBBox.width / 2 - me.width / 2);
            y = insets.top;
            break;
        case 'bottom':
            x = mfloor(insets.left + chartBBox.width / 2 - me.width / 2);
            y = mfloor(surface.height - me.height) - insets.bottom;
            break;
        default:
            x = mfloor(me.origX) + insets.left;
            y = mfloor(me.origY) + insets.top;
        };
        
        return { x: x, y: y };
    },
    
    /**
     * @private Calculates maximum available box for Legend.
     */
    getMaximumBBox: function() {
        var me = this,
            surface = me.chart.surface,
            insets, chartWidth, chartHeight;
        
        insets = me.getChartInsets();
        
        chartWidth  = surface.width  - insets.left - insets.right;
        chartHeight = surface.height - insets.top  - insets.bottom;
        
        return { width: chartWidth, height: chartHeight };
    },
    
    /**
     * @private Positions all items within Legend box.
     */
    alignItems: function() {
        var me = this,
            items = me.items,
            numItems = me.items.length,
            padding = me.padding,
            itemSpacing = me.itemSpacing,
            vertical = me.isVertical,
            mceil = Math.ceil,
            mfloor = Math.floor,
            mmax = Math.max,
            x, y, bbox, height, width, dim;
    
        dim = me.updateItemDimensions();

        var maxWidth    = dim.maxWidth,
            maxHeight   = dim.maxHeight,
            totalWidth  = dim.totalWidth,
            totalHeight = dim.totalHeight,
            spacing     = dim.spacing;

        bbox = me.getMaximumBBox();
        
        // Ugh. All this verboseness is just because there is no list context assignment.
        // JS sucks.
        var totalDim  = vertical ? totalHeight : totalWidth,
            stuffInto = vertical ? bbox.height : bbox.width;
        
        // Account for padding
        stuffInto -= padding * 2;
        
        // I call them lines because they can be either columns or rows
        var lines, perLine, fract;
        
        lines   = mceil(totalDim / stuffInto);
        fract   = (totalDim / stuffInto) - mfloor(totalDim / stuffInto);
        lines  += fract > 0.8 ? 1 : 0;
        perLine = mceil(numItems / lines);
        
        // Position the items
        for ( var line = 0; line < lines; line++ ) {
            var cumulative = 0;
            
            for ( var cursor = 0; cursor < perLine; cursor++ ) {
                var item = items[ (line*perLine) + cursor ];
                
                if ( item === undefined ) {
                    continue;
                };
                
                x = vertical ? line   * (maxWidth  + spacing)
                  :            cursor * (maxWidth  + spacing)
                  ;
                y = vertical ? cursor * (maxHeight + spacing)
                  :            line   * (maxHeight + spacing)
                  ;
                
                item.x = x + padding;
                item.y = y + (vertical ? padding + maxHeight / 2 : padding + maxHeight / 2);
            };
        };
        
        // Calculate legend box dimensions
        me.width   = vertical ? lines   * (maxWidth + spacing) - spacing
                   :            perLine * (maxWidth + spacing) - spacing
                   ;
        me.width  += padding * 2;
        
        me.height  = vertical ? perLine * (maxHeight + spacing) - spacing
                   :            lines   * (maxHeight + spacing) - spacing
                   ;
        me.height += padding * 2;
        
        me.itemHeight = maxHeight;
    },
    
    /**
     * @private Toggles Legend visibility.
     */
    toggleVisibility: function(visible) {
        var me = this,
            items = me.items;
        
        me.visible = visible;
        
        Ext.each(items, function(item) {
            visible ? item.show(true) : item.hide(true);
        }, me);
        
        visible ? me.boxSprite.show(true) : me.boxSprite.hide(true);
    },

    /**
     * @private Shows the Legend.
     */
    show: function() {
        var me = this;
        
        me.toggleVisibility(true);
    },
    
    /**
     * @private Hides the Legend.
     */
    hide: function() {
        var me = this;
        
        me.toggleVisibility(false);
    }
});