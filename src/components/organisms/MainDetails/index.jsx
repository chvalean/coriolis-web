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

import * as React from 'react'
import styled, { css } from 'styled-components'

import EndpointLogos from '../../atoms/EndpointLogos'
import CopyValue from '../../atoms/CopyValue'
import StatusIcon from '../../atoms/StatusIcon'
import StatusImage from '../../atoms/StatusImage'
import Table from '../../molecules/Table'

import type { MainItem } from '../../../types/MainItem'
import type { Endpoint } from '../../../types/Endpoint'
import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'
import DateUtils from '../../../utils/DateUtils'
import LabelDictionary from '../../../utils/LabelDictionary'

import arrowImage from './images/arrow.svg'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 48px;
`
const ColumnsLayout = styled.div`
  display: flex;
`
const Column = styled.div`
  width: ${props => props.width};
`
const Arrow = styled.div`
  width: 34px;
  height: 24px;
  background: url('${arrowImage}') center no-repeat;
  margin-top: 68px;
`
const Row = styled.div`
  margin-bottom: 32px;
  &:last-child {
    margin-bottom: 16px;
  }
`
const Field = styled.div`
  display: flex;
  flex-direction: column;
`
const Label = styled.div`
  font-size: 10px;
  color: ${Palette.grayscale[3]};
  font-weight: ${StyleProps.fontWeights.medium};
  text-transform: uppercase;
`
const Value = styled.div`
  display: ${props => props.flex ? 'flex' : props.block ? 'block' : 'inline-table'};
  margin-top: 3px;
  ${props => props.capitalize ? 'text-transform: capitalize;' : ''}
`
const ValueLink = styled.a`
  display: flex;
  margin-top: 3px;
  color: ${Palette.primary};
  text-decoration: none;
  cursor: pointer;
`
const TableStyled = styled(Table)`
  margin-top: 89px;
  margin-bottom: 48px;
`
const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`
const PropertiesTable = styled.div``
const PropertyRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
`
const PropertyText = css``
const PropertyName = styled.div`
  ${PropertyText}
`
const PropertyValue = styled.div`
  ${PropertyText}
  color: ${Palette.grayscale[4]};
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
`

type Props = {
  item: ?MainItem,
  endpoints: Endpoint[],
  bottomControls: React.Node,
  loading: boolean,
}
class MainDetails extends React.Component<Props> {
  getSourceEndpoint(): ?Endpoint {
    let endpoint = this.props.endpoints.find(e => this.props.item && e.id === this.props.item.origin_endpoint_id)
    return endpoint
  }

  getDestinationEndpoint(): ?Endpoint {
    let endpoint = this.props.endpoints.find(e => this.props.item && e.id === this.props.item.destination_endpoint_id)
    return endpoint
  }

  getLastExecution() {
    if (this.props.item && this.props.item.executions && this.props.item.executions.length) {
      return this.props.item.executions[this.props.item.executions.length - 1]
    }

    return {}
  }

  getConnectedVms(networkId: string) {
    let vms = []
    if (!this.props.item) {
      return '-'
    }
    Object.keys(this.props.item.info).forEach(key => {
      // $FlowIssue
      let instance = this.props.item.info[key]
      if (instance.export_info && instance.export_info.devices.nics.length) {
        instance.export_info.devices.nics.forEach(nic => {
          if (nic.network_name === networkId) {
            vms.push(key)
          }
        })
      }
    })

    return vms.length === 0 ? '-' : vms
  }

  getNetworks() {
    if (!this.props.item || !this.props.item.destination_environment || !this.props.item.destination_environment.network_map) {
      return null
    }
    let networks = []
    Object.keys(this.props.item.destination_environment.network_map).forEach(key => {
      let newItem
      if (this.props.item && typeof this.props.item.destination_environment.network_map[key] === 'object') {
        newItem = [
          this.props.item.destination_environment.network_map[key].source_network,
          this.getConnectedVms(key),
          // $FlowIssue
          this.props.item.destination_environment.network_map[key].destination_network,
          'Existing network',
        ]
      } else {
        newItem = [
          key,
          this.getConnectedVms(key),
          this.props.item ? this.props.item.destination_environment.network_map[key] : '-',
          'Existing network',
        ]
      }
      networks.push(newItem)
    })

    return networks
  }

  renderLastExecutionTime() {
    let lastExecution = this.getLastExecution()
    if (lastExecution.updated_at || lastExecution.created_at) {
      return this.renderValue(DateUtils.getLocalTime(lastExecution.updated_at || lastExecution.created_at).format('YYYY-MM-DD HH:mm:ss'))
    }

    return <Value>-</Value>
  }

  renderValue(value: string) {
    return <CopyValue value={value} maxWidth="90%" />
  }

  renderNetworksTable() {
    if (this.props.loading) {
      return null
    }

    let items = this.getNetworks()

    if (!items || !items.length) {
      return null
    }

    return (
      <TableStyled
        header={['Source Network', 'Connected VMs', 'Destination Network', 'Destination Type']}
        items={items}
        columnsStyle={[css`color: ${Palette.black};`]}
      />
    )
  }

  renderEndpointLink(type: string): React.Node {
    let endpointIsMissing = (
      <Value flex>
        <StatusIcon style={{ marginRight: '8px' }} status="ERROR" />Endpoint is missing
      </Value>
    )

    let endpoint = type === 'source' ? this.getSourceEndpoint() : this.getDestinationEndpoint()

    if (endpoint) {
      return <ValueLink href={`/#/endpoint/${endpoint.id}`}>{endpoint.name}</ValueLink>
    }

    return endpointIsMissing
  }

  renderPropertiesTable() {
    let renderValue = (value: any) => {
      if (value === true) {
        return 'Yes'
      }
      if (value === false) {
        return 'No'
      }
      return value.toString()
    }

    return (
      <PropertiesTable>
        {this.props.item ? Object.keys(this.props.item.destination_environment).map(propName => {
          let skipProps = ['description', 'network_map']
          if (skipProps.find(p => p === propName)) {
            return null
          }
          return (
            <PropertyRow key={propName}>
              <PropertyName>{LabelDictionary.get(propName)}</PropertyName>
              <PropertyValue>{renderValue(this.props.item ? this.props.item.destination_environment[propName] : '')}</PropertyValue>
            </PropertyRow>
          )
        }) : null}
      </PropertiesTable>
    )
  }

  renderTable() {
    if (this.props.loading) {
      return null
    }
    const sourceEndpoint = this.getSourceEndpoint()
    const destinationEndpoint = this.getDestinationEndpoint()

    return (
      <ColumnsLayout>
        <Column width="40%">
          <Row>
            <Field>
              <Label>Source</Label>
              {this.renderEndpointLink('source')}
            </Field>
          </Row>
          <Row>
            <EndpointLogos endpoint={sourceEndpoint ? sourceEndpoint.type : ''} />
          </Row>
          <Row>
            <Field>
              <Label>Id</Label>
              <CopyValue value={this.props.item ? this.props.item.id : '-'} width="192px" />
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Created</Label>
              {this.props.item && this.props.item.created_at ? this.renderValue(DateUtils.getLocalTime(this.props.item.created_at).format('YYYY-MM-DD HH:mm:ss')) : <Value>-</Value>}
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Description</Label>
              {this.props.item && this.props.item.destination_environment && this.props.item.destination_environment.description ? this.renderValue(this.props.item.destination_environment.description) : <Value>-</Value>}
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Type</Label>
              <Value capitalize>Coriolis {this.props.item && this.props.item.type}</Value>
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Last Updated</Label>
              <Value>{this.renderLastExecutionTime()}</Value>
            </Field>
          </Row>
        </Column>
        <Column width="20%">
          <Arrow />
        </Column>
        <Column width="40%">
          <Row>
            <Field>
              <Label>Target</Label>
              {this.renderEndpointLink('target')}
            </Field>
          </Row>
          <Row>
            <EndpointLogos endpoint={destinationEndpoint ? destinationEndpoint.type : ''} />
          </Row>
          <Row>
            <Field>
              <Label>Properties</Label>
              <Value block>{this.renderPropertiesTable()}</Value>
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Instances</Label>
              <Value>{this.props.item && this.props.item.instances.join(', ')}</Value>
            </Field>
          </Row>
        </Column>
      </ColumnsLayout>
    )
  }

  renderBottomControls() {
    if (this.props.loading) {
      return null
    }

    return this.props.bottomControls
  }

  renderLoading() {
    if (!this.props.loading) {
      return null
    }

    return (
      <Loading>
        <StatusImage loading />
      </Loading>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.renderTable()}
        {this.renderNetworksTable()}
        {this.renderBottomControls()}
        {this.renderLoading()}
      </Wrapper>
    )
  }
}

export default MainDetails