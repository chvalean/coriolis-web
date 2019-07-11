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

import React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
`
const Item = styled.div`
  width: 112px;
  height: 14px;
  background: ${props => props.selected ? Palette.primary : 'white'};
  color: ${props => props.selected ? 'white' : Palette.primary};
  border: 1px solid ${Palette.primary};
  border-right: 1px solid white;
  text-align: center;
  line-height: 15px;
  text-transform: uppercase;
  font-size: 9px;
  font-weight: ${StyleProps.fontWeights.medium};
  transition: all ${StyleProps.animations.swift};
  cursor: pointer;
  &:first-child {
    border-top-left-radius: ${StyleProps.borderRadius};
    border-bottom-left-radius: ${StyleProps.borderRadius};
    border-right: 1px solid ${Palette.primary};
  }
  &:last-child {
    border-top-right-radius: ${StyleProps.borderRadius};
    border-bottom-right-radius: ${StyleProps.borderRadius};
    border-right: 1px solid ${Palette.primary};
  }
`

type ItemType = { value: string, label: string }
type Props = {
  items: Array<ItemType>,
  selectedValue?: string,
  onChange?: (item: ItemType) => void,
  className?: string,
  'data-test-id'?: string,
  style?: { [string]: mixed },
}
@observer
class ToggleButtonBar extends React.Component<Props> {
  render() {
    if (!this.props.items) {
      return null
    }

    return (
      <Wrapper
        data-test-id={this.props['data-test-id'] || 'toggleButtonBar-wrapper'}
        className={this.props.className}
        style={this.props.style}
      >
        {this.props.items.map(item => {
          return (
            <Item
              data-test-id={`toggleButtonBar-${item.value}`}
              key={item.value}
              selected={this.props.selectedValue === item.value}
              onClick={() => { if (this.props.onChange) this.props.onChange(item) }}
            >{item.label}</Item>
          )
        })}
      </Wrapper>
    )
  }
}

export default ToggleButtonBar
