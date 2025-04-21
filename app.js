// Точка входа
Ext.application({
    name: 'ProductsApp',
    
    launch: function() {
        Ext.create('Ext.container.Viewport', {
            layout: 'fit',
            items: [{
                xtype: 'loginform',
                width: 400
            }]
        });
    }
});

// Interface товара
Ext.define('Product', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'name', type: 'string'},
        {name: 'description', type: 'string'},
        {name: 'price', type: 'float'},
        {name: 'quantity', type: 'int'}
    ]
});

// Store товаров
Ext.define('ProductsApp.store.Products', {
    extend: 'Ext.data.Store',
    model: 'Product',
    storeId: 'productsStore',
    data: [
        {id: 1, name: 'Ноутбук', description: 'игровой ноутбук, 2 ядра, 2 гига', price: 1500.00, quantity: 5},
        {id: 2, name: 'Смартфон Vivo', description: 'Флагманский смартфон', price: 999.00, quantity: 10},
        {id: 3, name: 'Наушники', description: 'Беспроводные наушники', price: 199.00, quantity: 0},
        {id: 4, name: 'Планшет', description: 'Графический планшет', price: 499.00, quantity: 3},
        {id: 5, name: 'Монитор', description: '4K монитор 27 дюймов', price: 399.00, quantity: 7}
    ]
});

// Форма авторизации
Ext.define('LoginForm', {
    extend: 'Ext.form.Panel',
    xtype: 'loginform',
    title: 'Авторизация',
    frame: true,
    bodyPadding: 10,
    defaultType: 'textfield',
    layout: {
        type: 'vbox',
        align: 'center',
        pack: 'center'
    },
    
    items: [{
        fieldLabel: 'Логин',
        name: 'username',
        itemId: 'usernameInput',
        allowBlank: false,
    }, {
        fieldLabel: 'Пароль',
        name: 'password',
        itemId: 'passwordInput',
        inputType: 'password',
        allowBlank: false,
    }],
    
    buttons: [{
        text: 'Вход',
        itemId: 'loginButton',
        formBind: true,
        handler: function() {
            const form = this.up('form').getForm();
            if (form.isValid()) {
                const values = form.getValues();
                console.log(values.username);
                console.log(values.password);

                if (values.username === 'admin' && values.password === 'padmin') {
                    const viewport = this.up('viewport');
                    viewport.removeAll();
                    viewport.add({
                        xtype: 'mainpanel'
                    });
                } else {
                    Ext.Msg.alert('Ошибка', 'Неверный логин или пароль');
                }
            }
        }
    }]
});

// Главная панель
Ext.define('MainPanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'mainpanel',
    
    layout: 'border',
    
    items: [{
        region: 'north',
        xtype: 'toolbar',
        items: [{
            text: 'Товары',
            handler: function() {
                const tabPanel = this.up('mainpanel').down('tabpanel');
                
                tabPanel.add({
                    title: 'Товары',
                    xtype: 'productspanel',
                    closable: true
                }).show();
            }
        }, '->', {
            text: 'Выход',
            handler: function() {
                console.log('Exit');
                const viewport = this.up('viewport');
                viewport.removeAll();
                
                const loginForm = Ext.create({
                    xtype: 'loginform'
                });
                
                loginForm.down('#usernameInput').setValue('');
                loginForm.down('#passwordInput').setValue('');
                
                viewport.add(loginForm);
            }
        }]
    }, {
        region: 'center',
        xtype: 'tabpanel'
    }]
});

// Панель товаров
Ext.define('ProductsPanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'productspanel',
    
    layout: 'fit',
    
    initComponent: function() {
        this.items = [{
            items: [{
                xtype: 'form',
                padding: 10,
                items: [{
                    xtype: 'textfield',
                    fieldLabel: 'ID товара',
                    name: 'idFilter',
                    padding: '0 0 3 0',
                    listeners: {
                        specialkey: function(field, e) {
                            if (e.getKey() === e.ENTER) {
                                this.up('productspanel').filterProducts();
                            }
                        }
                    }
                }, {
                    xtype: 'textfield',
                    fieldLabel: 'Описание',
                    name: 'descriptionFilter',
                    margin: '0 10 0 0',
                    listeners: {
                        specialkey: function(field, e) {
                            if (e.getKey() === e.ENTER) {
                                this.up('productspanel').filterProducts();
                            }
                        }
                    }
                }]
            }, {
                xtype: 'grid',
                store: Ext.create('ProductsApp.store.Products'),
                columns: [{
                    text: 'ID',
                    dataIndex: 'id',
                    width: 50
                }, {
                    text: 'Имя',
                    dataIndex: 'name',
                    flex: 1,
                }, {
                    text: 'Описание',
                    dataIndex: 'description',
                    flex: 2
                }, {
                    text: 'Цена',
                    dataIndex: 'price',
                    renderer: function(value) {
                        return Ext.util.Format.number(value, '0,000.00') + ' ₽';
                    }
                }, {
                    text: 'Кол-во',
                    dataIndex: 'quantity',
                    renderer: function(value, metaData) {
                        if (value === 0) {
                            metaData.tdCls = 'zero-quantity';
                        }
                        return value;
                    }
                }],
                listeners: {
                    cellclick: function(view, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                        if (cellIndex === 1) {
                            const productForm = Ext.create('ProductForm', {
                                title: 'Карточка товара: ' + record.get('name')
                            });
                            
                            productForm.loadRecord(record);
                            
                            Ext.create('Ext.window.Window', {
                                layout: 'fit',
                                width: 500, 
                                height: 400, 
                                minHeight: 300,
                                modal: true,
                                constrain: true,
                                items: [productForm]
                            }).show();
                        }
                    }
                }
            }]
        }];
        
        this.callParent();
    },
    filterProducts: function() {
        const form = this.down('form').getForm();
        const values = form.getValues();
        const grid = this.down('grid');
        const store = grid.getStore();
        
        store.clearFilter();
        
        const filters = [];
        
        if (values.idFilter) {
            filters.push({
                property: 'id',
                value: values.idFilter,
                exactMatch: true
            });
        }
        
        if (values.descriptionFilter) {
            filters.push({
                property: 'description',
                value: values.descriptionFilter,
                anyMatch: true
            });
        }
        
        if (filters.length > 0) {
            store.filter(filters);
        }
    }
});

// Форма редактирования товара
Ext.define('ProductForm', {
    extend: 'Ext.form.Panel',
    xtype: 'productform',
    
    bodyPadding: 10,
    defaults: {
        anchor: '100%',
        allowBlank: false
    },
    
    items: [{
        xtype: 'displayfield',
        name: 'id',
        fieldLabel: 'ID'
    }, {
        xtype: 'displayfield',
        name: 'name',
        fieldLabel: 'Имя'
    }, {
        xtype: 'displayfield',
        name: 'description',
        fieldLabel: 'Описание'
    }, {
        xtype: 'numberfield',
        name: 'price',
        fieldLabel: 'Цена',
        minValue: 0,
        decimalPrecision: 2,
        allowNegative: false
    }, {
        xtype: 'numberfield',
        name: 'quantity',
        fieldLabel: 'Кол-во',
        minValue: 0,
        allowDecimals: false,
        allowNegative: false
    }],
    
    buttons: [{
        text: 'Отмена',
        handler: function() {
            this.up('window').close();
        }
    }, {
        text: 'Сохранить',
        formBind: true,
        handler: function() {
            const form = this.up('form');
            const record = form.getRecord();
            const values = form.getValues();
            let changed = false;
            
            for (const field in values) {
                if (values[field] != record.get(field)) {
                    changed = true;
                    break;
                }
            }
            
            if (changed) {
                Ext.Msg.confirm('Подтверждение', 'Сохранить?', function(btn) {
                    if (btn === 'yes') {
                        record.set(values);
                        this.up('window').close();
                    }
                }, this);
            } else {
                this.up('window').close();
            }
        }
    }]
});

// Стили для товара с кол-вом 0 в красный цвет
Ext.onReady(function() {
    Ext.util.CSS.createStyleSheet(
        '.zero-quantity {background-color: red}'
    );
});