/*
 * Smart chart Legend: it tries hard to fit available Chart dimensions
 * without hogging all the space. Will rearrange itself in columns or rows.
 *  
 * Uses Smart legend item to provide explicit Series field titles, too.
 *
 * Version 0.99, compatible with Ext JS 4.1.
 *  
 * Copyright (c) 2011-2012 Alexander Tokarev.
 *  
 * Usage: drop-in replacement for Ext.chart.Legend. See demo application
 * for more details.
 *
 * This code is licensed under the terms of the Open Source LGPL 3.0 license.
 * Commercial use is permitted to the extent that the code/component(s) do NOT
 * become part of another Open Source or Commercially licensed development library
 * or toolkit without explicit permission.
 * 
 * License details: http://www.gnu.org/licenses/lgpl.html
 */

Ext.define('Ext.ux.chart.SmartLegend', {
    extend: 'Ext.ux.chart.Legend',
    
    requires: [ 'Ext.ux.chart.SmartLegendItem' ],
    
    /*
     * @cfg {String} seriesType Allows to trick Legend items into drawing
     * their markers with a style that differs from default series style;
     * like box marker for line or line marker for pie, etc.
     */
    
    /**
     * @private Create all the sprites for the legend
     */
    create: function() {
        var me = this,
            items = me.chart.series.items;
        
        // Avoid re-creation when Legend is invisible
        if ( me.rebuild || (!me.created && me.isDisplayed()) ) {
            me.createBox();
            me.createItems();
            me.updatePosition(true);
        };

        if (!me.created && me.isDisplayed()) {
            me.created = true;

            // Listen for changes to series titles to trigger regeneration of the legend
            for ( var i = 0, l = items.length; i < l; i++ ) {
                var series = items[i];

                series.on('titlechange', me.redraw, me);
            };
        }
    },
    
    /**
     * @private Get the bounds for the legend's outer box
     */
    getBBox: function() {
        var me = this,
            mround = Math.round;
        
        return {
            x:      mround(me.x - me.boxStrokeWidth / 2),
            y:      mround(me.y - me.boxStrokeWidth / 2),
            width:  mround(me.width),
            height: mround(me.height)
        };
    },
    
    /**
     * @private Update the position of all the legend's sprites to match its current x/y values
     */
    updatePosition: function(init) {
        var me = this,
            items = me.items,
            pos, myBBox, bsBBox;

        if ( !me.isDisplayed() ) return;
        
        // Find the position based on the dimensions
        pos    = me.calcPosition();
        myBBox = me.getBBox();
        bsBBox = me.boxSprite.getBBox();
        
        // We assume that if dimensions and box are current,
        // there is no need to update.
        if ( !init &&
             me.x == pos.x && me.y == pos.y &&
             myBBox.x == bsBBox.x && myBBox.y == bsBBox.y &&
             myBBox.height == bsBBox.height &&
             myBBox.width == bsBBox.width )
        {
            return;
        };
        
        me.x = myBBox.x = pos.x;
        me.y = myBBox.y = pos.y;

        // Update the position of each item
        for ( var i = 0, l = items.length; i < l; i++ ) {
            items[i].updatePosition();
        };
        
        // Update the position of the outer box
        me.boxSprite.setAttributes(myBBox, true);
    },
    
    /**
     * @private Creates single Legend Item.
     */
    createLegendItem: function(series, yFieldIndex) {
        var me = this,
            conf;
        
        conf = {
            legend:      me,
            series:      series,
            surface:     me.chart.surface,
            yFieldIndex: yFieldIndex
        };
        
        if ( me.seriesType !== undefined ) {
            Ext.apply(conf, {
                seriesType: me.seriesType
            });
        };
        
        return new Ext.ux.chart.SmartLegendItem(conf);
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
            insets, cWidth, lWidth, cHeight, lHeight, sWidth, sHeight,
            aWidth, aHeight, x, y, haveWidth, haveHeight;
        
        // Support for refactored Chart
        insets = me.getChartInsets();
        
        sWidth  = surface.width;
        sHeight = surface.height;
        cWidth  = chartBBox.width;
        cHeight = chartBBox.height;
        lWidth  = me.width;
        lHeight = me.height;
        
        // A is for "available"
        aWidth  = sWidth  - insets.left - insets.right;
        aHeight = sHeight - insets.top  - insets.bottom;
        
        // Legend either fits between insets or it doesn't,
        // in which case we don't care to place it accurately enough
        haveWidth  = aWidth  >= lWidth;
        haveHeight = aHeight >= lHeight;

        // Find position based on dimensions
        // Take into account that insets can be different on sides
        switch ( me.position ) {
        case 'left':
            x = insets.left;
            y = haveHeight ? mfloor(insets.top + aHeight / 2 - lHeight / 2)
              :              mfloor(sHeight / 2 - lHeight / 2)
              ;
            break;
        case 'right':
            x = mfloor(sWidth - lWidth) - insets.right;
            y = haveHeight ? mfloor(insets.top + aHeight / 2 - lHeight / 2)
              :              mfloor(sHeight / 2 - lHeight / 2)
              ;
            break;
        case 'top':
            x = haveWidth ? mfloor(insets.left + aWidth / 2 - lWidth / 2)
              :             mfloor(sWidth / 2 - lWidth / 2)
              ;
            y = insets.top;
            break;
        case 'bottom':
            x = haveWidth ? mfloor(insets.left + aWidth / 2 - lWidth / 2)
              :             mfloor(sWidth / 2 - lWidth / 2)
              ;
            y = mfloor(sHeight - lHeight) - insets.bottom;
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
        
        if ( totalDim < stuffInto ) {
            lines   = 1;
            perLine = numItems;
        }
        else {
            lines   = mceil(totalDim / stuffInto);
            fract   = (totalDim / stuffInto) - mfloor(totalDim / stuffInto);
            lines  += fract > 0.8 ? 1 : 0;
            perLine = mceil(numItems / lines);
        };
        
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
        
        for ( var i = 0, l = items.length; i < l; i++ ) {
            var item = items[i];
            
            visible ? item.show(true) : item.hide(true);
        };
        
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