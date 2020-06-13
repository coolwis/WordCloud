import React from 'react';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { FloatingActionButton, Dialog, FlatButton, TextField } from 'material-ui';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import ContentAddIcon from 'material-ui/svg-icons/content/add';
import TextTruncate from 'react-text-truncate'; //문장이 길 경우 줄임문자로 표시 ...
import {Link} from 'react-router-dom'; //중복되는 모듈명은 alias로 변경사용 가능 ex)  {Link as RouterLink}

import '../index.css';


//hidden 이라는 클래스 지정
const styles = theme => ({
    hidden: {
        display: 'none'
    }
});

//오른쪽 아래 떠다니는 버튼을 위함
const fabStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px'
};

const databaseURL = "https://word-cloud-21f19.firebaseio.com/";
  
class Texts extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            fileName: '',
            fileContent: null, //파일 내용
            texts: '',
            dialog: false
        }
        this.handleFileChange = this.handleFileChange.bind(this);
    }

    _get() {
        fetch(`${databaseURL}/texts.json`).then(res => {
            if(res.status != 200) {
                throw new Error(res.statusText);
            }
            return res.json();
            //받아온 texts에 빈값이면 {} 로 비워놓음
        }).then(texts => this.setState({texts: (texts == null) ? {} : texts})); 
    }

    _post(text) {
        return fetch(`${databaseURL}/texts.json`, {
            method: 'POST',
            body: JSON.stringify(text)
        }).then(res => {
            if(res.status != 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(data => {
            let nextState = this.state.texts;
            nextState[data.name] = text;
            this.setState({texts: nextState});
        });
    }

    _delete(id) {
        return fetch(`${databaseURL}/texts/${id}.json`, {
            method: 'DELETE'
        }).then(res => {
            if(res.status != 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(() => {
            let nextState = this.state.texts;
            delete nextState[id];
            this.setState({texts: nextState});
        });
    }

    //페이지 로드 완료후
    componentDidMount() {
        this._get();
    }

    handleDialogToggle = () => this.setState({
        dialog: !this.state.dialog,
        fileName: '',
        fileContent: ''
    })

    handleSubmit = () => {
        const text = {
            textName: this.textName.getValue(),
            textContent: this.state.fileContent
        }
        this.handleDialogToggle();
        if (!text.textName || !text.textContent) {
            return;
        }
        this._post(text);
    }

    handleDelete = (id) => {
        this._delete(id);
    }

    //사용자의 파일을 Load 기능
    handleFileChange(e) {
        let reader = new FileReader();
        reader.onload = () => {
            let text = reader.result; //file내용
            this.setState({
                fileContent: text
            })
        }
        reader.readAsText(e.target.files[0], "EUC_KR"); //첫번째 파일을 읽음
        this.setState({
            fileName: e.target.value
        });
    }

    render() {
        const { classes } = this.props;
        return (            
            <div>
                {Object.keys(this.state.texts).map(id => {
                    const text = this.state.texts[id];
                    return (
                        <Card key={id} style={{marginTop: '5px', paddingTop: '10px', paddingBottom: '10px'}}>
                            이름: <CardHeader title={text.textName.substring(0, 12) + '...'}/>

                            {/* container 클래스지정해야 가로로 나열됨 
                                item xs를 통해서 6:3:3 비율로 가로 길이 설정가능
                            */}

                            <Grid container> 
                                <Grid style={{marginTop: '7px', display: 'flex', justifyContent: 'center'}} item xs={7}>
                                    {text.textContent.substring(0, 20) + '...'}
                                </Grid>
                                <Grid style={{display: 'flex', justifyContent: 'center'}} item xs={2}><Link to={"detail/" + id}><Button variant="contained" color="primary">보기</Button></Link></Grid>
                                <Grid style={{display: 'flex', justifyContent: 'center'}} item xs={2}><Button variant="contained" color="primary" onClick={() => this.handleDelete(id)}>삭제</Button></Grid>
                            </Grid>
                        </Card>
                    );
                })}
                <FloatingActionButton style={fabStyle} onClick={this.handleDialogToggle}>
                    <ContentAddIcon/>
                </FloatingActionButton>
                <Dialog
                    title="텍스트 추가"
                    actions={<FlatButton label="추가" primary={true} onClick={this.handleSubmit}/>} //텍스트업로드 함수 호출
                    modal={false}
                    open={this.state.dialog}
                    onRequestClose={this.handleDialogToggle}>
                    <div>텍스트 이름을 작성하세요.</div>
                    <TextField hintText="이름" name="textName" ref={ref => this.textName=ref}/>
                    
                    <div></div>
                    {/* 보이지 않는 input tag를 사용, 값 변경시 handleFileChange 함수 호출 */}
                    <input className={classes.hidden} accept="text/plain" id="raised-button-file" type="file" value={(this.state.fileName)? this.state.fileName : null} onChange={this.handleFileChange} />
                    <label htmlFor="raised-button-file"> 
                        <Button variant="contained" color="primary" component="span" name="file">
                            {/* {this.state.fileName === ''? ".txt 파일 선택" : this.state.fileName} */}
                            {"txt 파일을 선택하세요."}
                        </Button>
                    </label><br/>
                    <label>{this.state.fileName}</label>
                    <TextTruncate
                        line={1}
                        truncateText="..."
                        text={this.state.fileContent}
                    />
                </Dialog>
            </div>
        );
    }
}

//style을 적용해서 component를 내보냄
export default withStyles(styles)(Texts);