import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'

// タスクフォームの初期値
const emptyForm = { title: '', due_date: '', priority: '中', is_done: false }

function Tasks() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  // タスク一覧を取得（自分が登録したタスクのみRLSにより返ってくる）
  const fetchTasks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true })

    if (error) {
      setErrorMessage('タスクの取得に失敗しました：' + error.message)
    } else {
      setTasks(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // ログアウト処理
  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  // フォーム入力値の変更
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  // 編集開始：フォームに既存の値をセットする
  const handleEdit = (task) => {
    setEditingId(task.id)
    setForm({
      title: task.title,
      due_date: task.due_date,
      priority: task.priority,
      is_done: task.is_done,
    })
  }

  // 編集キャンセル
  const handleCancel = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  // 新規登録・更新の送信処理
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const taskData = {
      title: form.title,
      due_date: form.due_date,
      priority: form.priority,
      is_done: form.is_done,
    }

    if (editingId) {
      // 既存タスクの更新
      const { error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', editingId)

      if (error) {
        setErrorMessage('更新に失敗しました：' + error.message)
        return
      }
    } else {
      // 新規タスクの登録（user_idはログインユーザーのIDを設定）
      const { error } = await supabase
        .from('tasks')
        .insert({ ...taskData, user_id: session.user.id })

      if (error) {
        setErrorMessage('登録に失敗しました：' + error.message)
        return
      }
    }

    setForm(emptyForm)
    setEditingId(null)
    fetchTasks()
  }

  // タスクの削除
  const handleDelete = async (id) => {
    setErrorMessage('')
    const { error } = await supabase.from('tasks').delete().eq('id', id)

    if (error) {
      setErrorMessage('削除に失敗しました：' + error.message)
      return
    }

    fetchTasks()
  }

  return (
    <div className="tasks-container">
      <header className="tasks-header">
        <h1>タスク一覧</h1>
        <button onClick={handleLogout}>ログアウト</button>
      </header>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* タスクの新規登録・編集フォーム */}
      <form className="task-form" onSubmit={handleSubmit}>
        <h2>{editingId ? 'タスクを編集' : 'タスクを新規登録'}</h2>
        <div className="form-group">
          <label htmlFor="title">タスク名</label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="due_date">期限</label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            value={form.due_date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="priority">優先度</label>
          <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
            <option value="高">高</option>
            <option value="中">中</option>
            <option value="低">低</option>
          </select>
        </div>
        <div className="form-group checkbox-group">
          <label htmlFor="is_done">
            <input
              id="is_done"
              name="is_done"
              type="checkbox"
              checked={form.is_done}
              onChange={handleChange}
            />
            完了
          </label>
        </div>
        <div className="form-actions">
          <button type="submit">{editingId ? '更新する' : '登録する'}</button>
          {editingId && (
            <button type="button" className="secondary" onClick={handleCancel}>
              キャンセル
            </button>
          )}
        </div>
      </form>

      {/* タスク一覧 */}
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div className={`task-card ${task.is_done ? 'done' : ''}`} key={task.id}>
              <h2>{task.title}</h2>
              <p>期限：{task.due_date}</p>
              <p>優先度：{task.priority}</p>
              <p>状態：{task.is_done ? '完了' : '未完了'}</p>
              <div className="card-actions">
                <button onClick={() => handleEdit(task)}>編集</button>
                <button className="danger" onClick={() => handleDelete(task.id)}>
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Tasks
