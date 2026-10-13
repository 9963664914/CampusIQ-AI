from django import forms


class CSVUploadForm(forms.Form):
    upload = forms.FileField(
        label='Student CSV upload',
        help_text='Upload a CSV file with student records. Columns are validated before import.',
        widget=forms.ClearableFileInput(attrs={'accept': '.csv', 'class': 'form-control'}),
    )

    def clean_upload(self):
        uploaded_file = self.cleaned_data['upload']
        if not uploaded_file.name.lower().endswith('.csv'):
            raise forms.ValidationError('Upload a file with the .csv extension.')
        if uploaded_file.size == 0:
            raise forms.ValidationError('The uploaded CSV file is empty.')
        if uploaded_file.size > 10 * 1024 * 1024:
            raise forms.ValidationError('CSV files must be 10 MB or smaller.')
        return uploaded_file
