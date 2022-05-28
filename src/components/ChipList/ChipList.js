import { Chip, Autocomplete, TextField } from '@mui/material';

const ChipList = (props) => {
    return (
        <Autocomplete
            multiple
            options={[]}
            freeSolo
            sx={{display: 'inline-block', ...props.sx}}
            value={props.value}
            clearOnBlur
            onChange={(event, newValue) => {
                props.onChange(newValue);
            }}
            renderTags={(value, getTagProps) => {
                return (value.map((option, index) => {
                    return (
                        <Chip
                            variant="filled"
                            color={props.color}
                            label={option}
                            size="small"

                            {...getTagProps({ index })}
                        />
                    )
                }))
            }
            }
            renderInput={(params) => (
                <TextField
                    error={props.error}
                    {...params}
                    helperText={props.helperText}
                    variant={props.variant}
                    label={props.label}
                    color={props.color}
                    placeholder={props.placeholder}
                />
            )}
        />
    );

}

export default ChipList;