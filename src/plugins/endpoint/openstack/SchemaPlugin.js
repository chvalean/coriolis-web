/*
Copyright (C) 2017  Cloudbase Solutions SRL
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.
You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// @flow

import type { Schema } from '../../../types/Schema'
import type { Field } from '../../../types/Field'

import DefaultConnectionSchemaParser from '../default/SchemaPlugin'

const customSort = (fields: Field[]) => {
  const sortPriority = {
    name: 1,
    description: 2,
    username: 3,
    password: 4,
    auth_url: 5,
    project_name: 6,
    glance_api_version: 7,
    identity_api_version: 8,
    project_domain_name: 9,
    project_domain_id: 10,
    user_domain_name: 11,
    user_domain_id: 12,
  }
  fields.sort((a, b) => {
    if (sortPriority[a.name] && sortPriority[b.name]) {
      return sortPriority[a.name] - sortPriority[b.name]
    }
    if (sortPriority[a.name]) {
      return -1
    }
    if (sortPriority[b.name]) {
      return 1
    }
    return a.name.localeCompare(b.name)
  })

  return fields
}

export default class ConnectionSchemaParser {
  static parseSchemaToFields(schema: Schema): Field[] {
    let fields = DefaultConnectionSchemaParser.parseSchemaToFields(schema)
    let identityField = fields.find(f => f.name === 'identity_api_version')
    if (identityField && !identityField.default) {
      identityField.default = identityField.minimum
    }
    customSort(fields)

    let projectDomainField = fields.find(f => f.name === 'project_domain_name')
    let projectDomainIdField = fields.find(f => f.name === 'project_domain_id')
    let userDomainField = fields.find(f => f.name === 'user_domain_name')
    let userDomainIdField = fields.find(f => f.name === 'user_domain_id')
    let glanceApiVersionField = fields.find(f => f.name === 'glance_api_version')
    let identityApiVersionField = fields.find(f => f.name === 'identity_api_version')
    let isBasicFunc = (apiVersion: number) => apiVersion > 2
    if (
      projectDomainField &&
      userDomainField &&
      glanceApiVersionField &&
      identityApiVersionField &&
      userDomainIdField &&
      projectDomainIdField
    ) {
      projectDomainField.isBasic = isBasicFunc
      projectDomainIdField.isBasic = isBasicFunc
      userDomainField.isBasic = isBasicFunc
      userDomainIdField.isBasic = isBasicFunc
      glanceApiVersionField.isBasic = true
      glanceApiVersionField.isBasic = true
    }

    return fields
  }

  static parseFieldsToPayload(data: { [string]: mixed }, schema: Schema) {
    let payload = DefaultConnectionSchemaParser.parseFieldsToPayload(data, schema)
    return payload
  }
}
