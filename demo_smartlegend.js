/*
    Smart Legend extension demo application.

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

Ext.onReady(function () {
    var panel, chart, legend,
        store = Ext.create('Ext.data.Store', {
        fields: [ 'name', 'data' ],
        data: [
            { name: 'Field 0',  data: Math.random() * 100 },
            { name: 'Field 1',  data: Math.random() * 100 },
            { name: 'Field 2',  data: Math.random() * 100 },
            { name: 'Field 3',  data: Math.random() * 100 },
            { name: 'Field 4',  data: Math.random() * 100 },
            { name: 'Field 5',  data: Math.random() * 100 },
            { name: 'Field 6',  data: Math.random() * 100 },
            { name: 'Field 7',  data: Math.random() * 100 },
            { name: 'Field 8',  data: Math.random() * 100 },
            { name: 'Field 9',  data: Math.random() * 100 },
            { name: 'Field 10', data: Math.random() * 100 },
            { name: 'Field 11', data: Math.random() * 100 },
            { name: 'Field 12', data: Math.random() * 100 }
        ]
    });
    
    var buttonHandler = function(button, object) {
        var positions = { '&larr;': 'left', '&uarr;': 'top', '&rarr;': 'right', '&darr;': 'bottom' };
        
        switch ( object ) {
        case 'legend':
            if ( positions[button.text] ) {
                legend.position   = positions[button.text];
                legend.isVertical = !!("left|right".indexOf(legend.position) !== -1);
                chart.legend      = legend;
                legend.show && legend.show();
            }
            else {
                legend.hide && legend.hide();
                chart.legend = false;
            };
            break;
        case 'title':
            if ( positions[button.text] ) {
                chart.title = title;
                chart.titleLocation = positions[button.text];
            }
            else {
                chart.title = false;
            };
        };
        
        chart.redraw();
    };

    panel = Ext.create('widget.panel', {
        width: 450,
        height: 400,
        position: 'absolute',
        x: 100,
        y: 100,
        title: 'Smart Legend demo',
        renderTo: Ext.getBody(),
        layout: 'fit',
        tbar: [{
            xtype: 'tbtext',
            text:  'Move Legend:'
        }, {
            xtype: 'tbseparator'
        }, {
            text: '&larr;',
            handler: Ext.bind(buttonHandler, panel, [ 'legend' ], 1)
        }, {
            text: '&uarr;',
            handler: Ext.bind(buttonHandler, panel, [ 'legend' ], 1)
        }, {
            text: '&darr;',
            handler: Ext.bind(buttonHandler, panel, [ 'legend' ], 1)
        }, {
            text: '&rarr;',
            handler: Ext.bind(buttonHandler, panel, [ 'legend' ], 1)
        }, {
            text: '&otimes;',
            handler: Ext.bind(buttonHandler, panel, [ 'legend' ], 1)
        }, {
            xtype: 'tbseparator'
        }, {
            xtype: 'tbtext',
            text:  '&nbsp;'
        }, {
            hideLabel: true,
            id: 'legendFontText',
            xtype: 'textfield',
            width: 110,
            emptyText: 'CSS font:',
            listeners: {
                specialkey: function(field, event){
                    if (event.getKey() === event.ENTER) {
                        Ext.getCmp('legendFontButton').handler();
                    }
                }
            }
        }, {
            id: 'legendFontButton',
            text: 'Set font',
            handler: function(){
                legend.labelFont = Ext.getCmp('legendFontText').getValue();
                chart.redraw();
            }
        }],
        items: {
            xtype: 'chart',
            insetPadding: 5,
            id: 'chart',
            animate: Ext.isIE ? false : true,
            store: store,
            shadow: Ext.isIE ? false : true,
            legend: false,
            theme: 'Base:gradients',
            series: [{
                type: 'pie',
                field: 'data',
                showInLegend: true,
                label: {
                    display: 'rotate',
                    contrast: true
                },
                /*
                    yFieldTitle array defines text to display as
                    corresponding item title
                */
                yFieldTitle: [
                    'Title 0',
                    'Title 1',
                    'Title 2',
                    'Title 3',
                    'Title 4',
                    'Title 5',
                    'Title 6',
                    'Title 7',
                    'Title 8',
                    'Title 9',
                    'Title 10',
                    'Title 11',
                    'Title 12'
                ]
            }]
        }
    });
    
    chart = panel.down('chart');

    legend = chart.legend = Ext.create('Ext.ux.chart.SmartLegend', {
        position:       'right',
        chart:          chart,
        boxStrokeWidth: 1
    });
    
    chart.legend.redraw();
    chart.redraw();
});
