import { Modal, Input, Form } from "antd";
import { useEffect } from "react";

export default function ConversationFormModal({ open, onCancel, onOk, confirmLoading }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  return (
    <Modal
      title="New chat"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
      okText="Create"
      cancelText="Cancel"
      okButtonProps={{ className: "pink-gradient-btn", style: { borderRadius: 12, height: 38 } }}
      cancelButtonProps={{ className: "pink-outline-btn", style: { borderRadius: 12, height: 38 } }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => onOk?.(values)}
        style={{ marginTop: 10 }}
      >
        <Form.Item
          name="name"
          label="Conversation name"
          rules={[{ required: true, message: "Enter conversation name" }]}
        >
          <Input className="pink-input" style={{ height: 44 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}