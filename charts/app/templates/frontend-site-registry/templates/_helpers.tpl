{{/*
Expand the name of the chart.
*/}}
{{- define "frontendSiteRegistry.name" -}}
{{- printf "frontend-site-registry" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "frontendSiteRegistry.fullname" -}}
{{- $componentName := include "frontendSiteRegistry.name" .  }}
{{- if .Values.frontendSiteRegistry.fullnameOverride }}
{{- .Values.frontendSiteRegistry.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $componentName | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}


{{/*
Common labels
*/}}
{{- define "frontendSiteRegistry.labels" -}}
{{ include "frontendSiteRegistry.selectorLabels" . }}
{{- if .Values.global.tag }}
app.kubernetes.io/image-version: {{ .Values.global.tag | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/short-name: {{ include "frontendSiteRegistry.name" . }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "frontendSiteRegistry.selectorLabels" -}}
app.kubernetes.io/name: {{ include "frontendSiteRegistry.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}


