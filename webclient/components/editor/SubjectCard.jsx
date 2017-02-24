import React from 'react';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import Paper from 'material-ui/Paper';
import AutoComplete from 'material-ui/AutoComplete';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import ContentRemove from 'material-ui/svg-icons/content/remove';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';
import {Container, Col, Row, Visible} from 'react-grid-system';
import ContentAddCircleOutline from 'material-ui/svg-icons/content/add-circle-outline';
import LoadProps from './LoadSubjectProps';
import { FormsyCheckbox, FormsyDate, FormsyRadio, FormsyRadioGroup,
FormsySelect, FormsyText, FormsyTime, FormsyToggle, FormsyAutoComplete } from 'formsy-material-ui/lib';
import IconButton from 'material-ui/IconButton';
import AddButton from 'material-ui/svg-icons/content/add';

const styles = {
    customWidth: {
        width: 300
    },
};
export default class SubjectCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            subjectDetails: {},
            subjectCardJsx: '',
            attrObj: null,
            style: {
              marginLeft: 10,
              marginRight: 10,
              opacity: 0.2
            },
            propertyCount: 0,
        };
    }
    handleChange = (event, index, value) => this.setState({value: 3});

    componentWillReceiveProps(nextProps) {
        this.setState({subjectCardJsx: nextProps.subjectCardJsx});
        let subjectCard = {};
        let style = {
          marginLeft: 10,
          marginRight: 10,
          opacity: 1
        };
        if(nextProps.subjectCardJsx == 'new'){
            this.setState({
              style: style,
              subjectCardJsx: 'new'
            });
        }
        if(nextProps.subjectCardJsx == 'old'){
            this.setState({
              style: style,
              subjectCardJsx: 'old'
            });
        }
    }

    render() {
        let newSubject = '';
        if(this.state.subjectCardJsx == 'new'){
          newSubject = <LoadProps subjectDetails = {this.props.subjectCard} updateSubjectCard = {this.props.updateSubjectCard}/>;
        }
        if(this.state.subjectCardJsx == 'old'){
          newSubject = <LoadProps subjectDetails = {this.props.subjectCard} updateSubjectCard = {this.props.updateSubjectCard}/>
        }
        return (
            <Col lg={4} xl={4} md={4} sm={12} xs={12}>
              <Card style={this.state.style}>
                  <CardHeader title='Subject' titleStyle={{
                      fontSize: 20,
                      marginLeft: '50%'
                  }}/>
                  <CardText>
                    {newSubject}
                  </CardText>
                  <CardActions/>
                </Card>
            </Col>
        );
    }
}
