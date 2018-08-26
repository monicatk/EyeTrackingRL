# -*- coding: utf-8 -*-
"""
Created on Tue Jan 17 17:24:51 2017

@author: Daniel
"""

import mysql.connector

db = mysql.connector.connect(host='mysqlhost.uni-koblenz.de',
                               database='django',
                               user='django',
                               password='django')
