LOAD DATA
INFILE 'desc.dat'
INTO TABLE LTO_DOWNLOAD (
   pid                     position(001:009) char,
   pid_status_cd           position(010:010) char,
   legal_description       position(011:265) char,
   child_pid               position(266:274) char,
   child_pid_status_cd     position(275:275) char,
   child_legal_description position(276:530) char
)
