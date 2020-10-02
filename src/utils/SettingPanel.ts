interface SettingOption
{
    value: any;
    inner: boolean;
    [key: string]: any;
}

export interface SettingPanel
{
    title: string;
    options: { [key: string]: SettingOption; };
}
