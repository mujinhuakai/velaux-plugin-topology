import * as React from 'react';
import { AppRootProps } from '@velaux/data';
import { getBackendSrv, locale, Select, Field, Form } from '@velaux/ui';

interface State {
  targets?: Array<any>;
}

export class App extends React.PureComponent<AppRootProps, State> {
  form: Field;
  constructor(props: AppRootProps) {
    super(props);
    this.state = {
      targets: []
    };
    this.form = new Field(this, {
      onChange: (name: string, value: any) => {
        const { targets } = this.state;
        const tgt  = (targets || []).find(o => o.name === value);
        const values: any = this.form.getValues();
        values.clusters = [tgt?.cluster?.clusterName];
        values.namespace = tgt?.cluster?.namespace
        // @ts-ignore
        const { onChange } = this.props;
        if (onChange) {
          onChange(values);
        }
      },
    });
    // @ts-ignore
    if (this.props.registerForm) {
      // @ts-ignore
      this.props.registerForm(this.form);
    }
   
  }

   getTargets = () => {
    // @ts-ignore
    const { project } = this.props;
    getBackendSrv().get(`/api/v1/projects/${project}/targets`).then((res: any) => {
      this.setState({
        targets: res.targets
      })
    })
  }

  componentDidMount() {
    this.getTargets();
    this.setValues();
  }

  setValues = () => {
    // @ts-ignore
    const { value } = this.props;
    if (value) {
      this.form.setValues(value);
    }
  };

  validate = (callback: (error?: string) => void) => {
    this.form.validate((errors) => {
      if (errors) {
        console.log(errors);
        callback('ui schema validate failure');
        return;
      }
      callback();
    });
  };


  render() {
    const { targets } = this.state;
    const init = this.form.init;
    const options = targets && targets.map((o: any) => ({ label: o.name, value: o.name }))
    return (
      <Form field={this.form} className="plugin-container">
        <Form.Item
          required={true}
          labelAlign={'left'}
          label={'部署目标'}
          key={'targets'}
        >
          <Select
            hasClear
            locale={locale().Select}
            {
            ...init("targets", {
              initValue: {},
              rules: [{
                required: true,
                message: 'This field is required.'
              }]
            })
            }
            dataSource={options}
          />
        </Form.Item>
      </Form>
    )
  }
}
