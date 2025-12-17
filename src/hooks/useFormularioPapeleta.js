import { useState } from 'react';
import papeletaService from '../services/papeletaService';

/**
 * Custom hook para manejar el formulario de registro de papeletas
 */
export const useFormularioPapeleta = (onSuccess, setMensajeGlobal) => {
  const [papeletaForm, setPapeletaForm] = useState({
    nombreCompleto: '',
    dni: '',
    codigo: '',
    area: '',
    cargo: '',
    regimenLaboral: '',
    oficinaVisitar: '',
    motivo: '',
    fundamentacion: '',
    fecha: '',
    horaSalida: '',
    horaRetorno: ''
  });

  const [sinRetorno, setSinRetorno] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  // fieldErrors removed: conflicts are shown as top/global messages per UX decision
  const [buscandoEmpleado, setBuscandoEmpleado] = useState(false);
  const [empleadoEncontrado, setEmpleadoEncontrado] = useState(null);
  const [mensajeEmpleado, setMensajeEmpleado] = useState('');

  /**
   * Manejar cambios en el formulario
   */
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    // No per-field inline errors: clear global message when user edits
    if (mensaje && mensaje.texto) {
      setMensaje({ tipo: '', texto: '' });
      if (setMensajeGlobal) setMensajeGlobal({ tipo: '', texto: '' });
    }

    if (name === 'dni') {
      const dniLimpio = papeletaService.limpiarDNI(value);
      const dniFinal = dniLimpio.substring(0, 8);

      setPapeletaForm(prev => ({
        ...prev,
        [name]: dniFinal
      }));

      if (dniFinal.length === 8) {
        buscarEmpleadoPorDNI(dniFinal);
      } else {
        setEmpleadoEncontrado(null);
        setMensajeEmpleado('');
      }
    } else {
      if (empleadoEncontrado && ['nombreCompleto', 'area', 'cargo', 'regimenLaboral'].includes(name)) {
        limpiarDatosEmpleado();
      }

      setPapeletaForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  /**
   * Buscar empleado por DNI
   */
  const buscarEmpleadoPorDNI = async (dni) => {
    if (dni.length !== 8) {
      setEmpleadoEncontrado(null);
      setMensajeEmpleado('');
      return;
    }

    setBuscandoEmpleado(true);
    setMensajeEmpleado('');

    try {
      const resultado = await papeletaService.buscarEmpleadoPorDNI(dni);

      if (resultado.encontrado && resultado.datos) {
        setEmpleadoEncontrado(resultado.datos);
        setMensajeEmpleado('✓ Empleado encontrado');

        setPapeletaForm(prev => ({
          ...prev,
          nombreCompleto: resultado.datos.nombreCompleto || '',
          area: resultado.datos.area || '',
          cargo: resultado.datos.cargo || '',
          regimenLaboral: resultado.datos.regimenLaboral || ''
        }));
      } else {
        setEmpleadoEncontrado(null);
        setMensajeEmpleado('');

        setPapeletaForm(prev => ({
          ...prev,
          nombreCompleto: '',
          area: '',
          cargo: '',
          regimenLaboral: ''
        }));
      }
    } catch (error) {
      console.error('Error al buscar empleado:', error);
      setMensajeEmpleado('');
    } finally {
      setBuscandoEmpleado(false);
    }
  };

  /**
   * Limpiar datos de empleado encontrado
   */
  const limpiarDatosEmpleado = () => {
    setEmpleadoEncontrado(null);
    setMensajeEmpleado('');
  };

  /**
   * Manejar checkbox sin retorno
   */
  const handleSinRetornoChange = (e) => {
    const checked = e.target.checked;
    setSinRetorno(checked);

    if (checked) {
      setPapeletaForm(prev => ({
        ...prev,
        horaRetorno: ''
      }));
    }
  };

  /**
   * Seleccionar hora
   */
  const seleccionarHora = (tipo, tiempo) => {
    setPapeletaForm(prev => ({
      ...prev,
      [tipo]: tiempo
    }));
  };

  /**
   * Enviar formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensaje({ tipo: '', texto: '' });
    setCargando(true);

    try {
      const resultado = await papeletaService.crearPapeleta(papeletaForm);

      if (resultado.exito) {
        setMensaje({
          tipo: 'success',
          texto: resultado.mensaje
        });
        if (setMensajeGlobal) {
          setMensajeGlobal({ tipo: 'success', texto: resultado.mensaje });
          setTimeout(() => {
            setMensajeGlobal({ tipo: '', texto: '' });
          }, 4000);
        }
        limpiarFormulario();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Mostrar mensaje general en la parte superior; no mostramos errores inline por campo
        setMensaje({
          tipo: 'danger',
          texto: resultado.mensaje
        });
        if (setMensajeGlobal) {
          setMensajeGlobal({ tipo: 'danger', texto: resultado.mensaje });
        }
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      setMensaje({
        tipo: 'danger',
        texto: 'Error inesperado al registrar la papeleta'
      });
      if (setMensajeGlobal) {
        setMensajeGlobal({ tipo: 'danger', texto: 'Error inesperado al registrar la papeleta' });
      }
    } finally {
      setCargando(false);
    }
  };

  /**
   * Limpiar formulario
   */
  const limpiarFormulario = () => {
    setPapeletaForm({
      nombreCompleto: '',
      dni: '',
      codigo: '',
      area: '',
      cargo: '',
      regimenLaboral: '',
      oficinaVisitar: '',
      motivo: '',
      fundamentacion: '',
      fecha: '',
      horaSalida: '',
      horaRetorno: ''
    });
    setSinRetorno(false);
    setMensaje({ tipo: '', texto: '' });
    // no fieldErrors state
    setEmpleadoEncontrado(null);
    setMensajeEmpleado('');
    setBuscandoEmpleado(false);
  };

  return {
    papeletaForm,
    sinRetorno,
    cargando,
    mensaje,
    buscandoEmpleado,
    empleadoEncontrado,
    mensajeEmpleado,
    handleFormChange,
    handleSinRetornoChange,
    seleccionarHora,
    handleSubmit,
    limpiarFormulario,
    setMensaje
  };
};
