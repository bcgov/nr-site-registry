{{/*
Expand the name of the chart.
*/}}
{{- define "backendSites.name" -}}
{{- printf "backend-sites" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "backendSites.fullname" -}}
{{- $componentName := include "backendSites.name" .  }}
{{- if .Values.backendSites.fullnameOverride }}
{{- .Values.backendSites.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $componentName | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "backendSites.labels" -}}
{{ include "backendSites.selectorLabels" . }}
{{- if .Values.global.tag }}
app.kubernetes.io/image-version: {{ .Values.global.tag | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/short-name: {{ include "backendSites.name" . }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "backendSites.selectorLabels" -}}
app.kubernetes.io/name: {{ include "backendSites.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}


