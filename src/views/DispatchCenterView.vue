<template>
  <PageLayout 
    title="调度中心" 
    :actions="[
      { type: 'primary', text: '创建调度任务', icon: Plus, onClick: handleAddTask },
      { type: 'success', text: '创建物流单', icon: Box, onClick: handleCreateLogistics },
      { type: 'warning', text: '批量发货', icon: Van, onClick: handleBatchShipment },
      { type: 'info', text: '物流商管理', icon: Location, onClick: handleCarrierManagement },
      { type: 'danger', text: '异常追踪', icon: Warning, onClick: handleExceptionTracking }
    ]"
  >
    
    <!-- 搜索表单 -->
    <el-card shadow="never" class="search-form">
      <el-form :inline="true" @submit.prevent="handleSearch">
        <el-form-item label="任务编号">
          <el-input
            v-model="searchForm.taskNo"
            placeholder="请输入任务编号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="订单ID">
          <el-input
            v-model="searchForm.orderId"
            type="number"
            placeholder="请输入订单ID"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="任务状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择任务状态"
            clearable
          >
            <el-option label="待调度" value="pending" />
            <el-option label="调度中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="失败" value="failed" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="优先级">
          <el-select
            v-model="searchForm.priority"
            placeholder="请选择优先级"
            clearable
          >
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 调度任务列表 -->
    <el-card shadow="never" class="table-container">
      <el-table :data="taskList" stripe style="width: 100%">
        <el-table-column prop="id" label="任务ID" width="120" align="center" />
        <el-table-column prop="taskNo" label="任务编号" width="180" />
        <el-table-column prop="orderId" label="订单ID" width="120" align="center" />
        <el-table-column prop="warehouseName" label="仓库" width="120" align="center" />
        <el-table-column prop="requiredQuantity" label="需求数量" width="120" align="center" />
        <el-table-column prop="dispatchedQuantity" label="已调度数量" width="120" align="center" />
        <el-table-column prop="priority" label="优先级" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.priority === 'high' ? 'danger' : scope.row.priority === 'medium' ? 'warning' : 'success'">
              {{ scope.row.priority === 'high' ? '高' : scope.row.priority === 'medium' ? '中' : '低' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="
              scope.row.status === 'pending' ? 'info' : 
              scope.row.status === 'processing' ? 'warning' : 
              scope.row.status === 'completed' ? 'success' : 'danger'
            ">
              {{ 
                scope.row.status === 'pending' ? '待调度' : 
                scope.row.status === 'processing' ? '调度中' : 
                scope.row.status === 'completed' ? '已完成' : '失败'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column prop="endTime" label="完成时间" width="180" />
        <el-table-column label="操作" width="300" fixed="right" align="center">
          <template #default="scope">
            <div class="table-action-buttons">
              <el-button type="primary" size="small" @click="handleViewDetail(scope.row)" v-permission="'dispatch_view'">
                <el-icon><View /></el-icon>
                查看
              </el-button>
              <el-button type="warning" size="small" @click="handleEditTask(scope.row)" v-permission="'dispatch_edit'">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="success" size="small" @click="handleExecuteTask(scope.row)" :disabled="scope.row.status !== 'pending'" v-permission="'dispatch_execute'">
                <el-icon><Check /></el-icon>
                执行
              </el-button>
              <el-button type="danger" size="small" @click="handleCancelTask(scope.row)" :disabled="scope.row.status !== 'pending'" v-permission="'dispatch_cancel'">
                <el-icon><Delete /></el-icon>
                取消
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 编辑调度任务对话框 -->
    <EditDialog
      v-model="editDialogVisible"
      title="编辑调度任务"
      :is-loading="isEditLoading"
      @confirm="confirmEditTask"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="任务编号" prop="taskNo">
          <el-input v-model="editForm.taskNo" disabled />
        </el-form-item>
        <el-form-item label="订单ID" prop="orderId">
          <el-input v-model="editForm.orderId" disabled />
        </el-form-item>
        <el-form-item label="仓库" prop="warehouseName">
          <el-input v-model="editForm.warehouseName" disabled />
        </el-form-item>
        <el-form-item label="优先级" prop="priority" required>
          <el-select v-model="editForm.priority" placeholder="请选择优先级" clearable>
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </el-form-item>
        <el-form-item label="需求数量" prop="requiredQuantity" required>
          <el-input-number v-model="editForm.requiredQuantity" :min="1" :max="99999" />
        </el-form-item>
        <el-form-item label="已调度数量" prop="dispatchedQuantity">
          <el-input-number v-model="editForm.dispatchedQuantity" :min="0" :max="editForm.requiredQuantity" />
        </el-form-item>
        <el-form-item label="状态" prop="status" required>
          <el-select v-model="editForm.status" placeholder="请选择状态" clearable>
            <el-option label="待调度" value="pending" />
            <el-option label="调度中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="失败" value="failed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人" prop="operator">
          <el-input v-model="editForm.operator" placeholder="请输入操作人" clearable />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker 
            v-model="editForm.startTime" 
            type="datetime" 
            placeholder="请选择开始时间" 
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss"
            clearable 
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker 
            v-model="editForm.endTime" 
            type="datetime" 
            placeholder="请选择结束时间" 
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss"
            clearable 
          />
        </el-form-item>
      </el-form>
    </EditDialog>

    <!-- 查看任务详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="调度任务详情"
      width="600px"
      :close-on-click-modal="true"
      :append-to-body="true"
    >
      <div class="task-detail-content">
        <div class="detail-row"><strong>任务编号：</strong>{{ currentTask?.taskNo }}</div>
        <div class="detail-row"><strong>订单ID：</strong>{{ currentTask?.orderId }}</div>
        <div class="detail-row"><strong>仓库：</strong>{{ currentTask?.warehouseName }}</div>
        <div class="detail-row">
          <strong>优先级：</strong>
          <el-tag :type="currentTask?.priority === 'high' ? 'danger' : currentTask?.priority === 'medium' ? 'warning' : 'success'">
            {{ currentTask?.priority === 'high' ? '高' : currentTask?.priority === 'medium' ? '中' : '低' }}
          </el-tag>
        </div>
        <div class="detail-row"><strong>需求数量：</strong>{{ currentTask?.requiredQuantity }}</div>
        <div class="detail-row"><strong>已调度数量：</strong>{{ currentTask?.dispatchedQuantity }}</div>
        <div class="detail-row">
          <strong>状态：</strong>
          <el-tag :type="
            currentTask?.status === 'completed' ? 'success' : 
            currentTask?.status === 'processing' ? 'warning' : 
            currentTask?.status === 'failed' ? 'danger' : 'info'
          ">
            {{
              currentTask?.status === 'pending' ? '待调度' : 
              currentTask?.status === 'processing' ? '调度中' : 
              currentTask?.status === 'completed' ? '已完成' : 
              currentTask?.status === 'failed' ? '失败' : '已取消'
            }}
          </el-tag>
        </div>
        <div class="detail-row" v-if="currentTask?.operator"><strong>操作人：</strong>{{ currentTask.operator }}</div>
        <div class="detail-row" v-if="currentTask?.startTime"><strong>开始时间：</strong>{{ currentTask.startTime }}</div>
        <div class="detail-row" v-if="currentTask?.endTime"><strong>完成时间：</strong>{{ currentTask.endTime }}</div>
        <div class="detail-row"><strong>创建时间：</strong>{{ currentTask?.createdAt }}</div>
        <div class="detail-row"><strong>更新时间：</strong>{{ currentTask?.updatedAt }}</div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 创建调度任务对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="创建调度任务"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="100px"
      >
        <el-form-item label="订单ID" prop="orderId">
          <el-input-number
            v-model="createForm.orderId"
            :min="1"
            :max="999999"
            placeholder="请输入订单ID"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="仓库" prop="warehouseId">
          <el-select
            v-model="createForm.warehouseId"
            placeholder="请选择仓库"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="warehouse in warehouseList"
              :key="warehouse.id"
              :label="warehouse.name"
              :value="warehouse.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-select
            v-model="createForm.priority"
            placeholder="请选择优先级"
            style="width: 100%"
            clearable
          >
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </el-form-item>

        <el-form-item label="需求数量" prop="requiredQuantity">
          <el-input-number
            v-model="createForm.requiredQuantity"
            :min="1"
            :max="999999"
            placeholder="请输入需求数量"
            style="width: 100%"
          />
        </el-form-item>

        <el-divider content-position="left">调度商品明细</el-divider>

        <div v-for="(item, index) in createForm.items" :key="index" class="dispatch-item-form">
          <el-form-item
            :label="'商品' + (index + 1)"
            :prop="'items.' + index + '.productName'"
            :rules="{ required: true, message: '请输入商品名称', trigger: 'blur' }"
          >
            <el-input v-model="item.productName" placeholder="商品名称" />
          </el-form-item>
          <el-form-item
            :prop="'items.' + index + '.sku'"
            :rules="{ required: true, message: '请输入SKU', trigger: 'blur' }"
          >
            <el-input v-model="item.sku" placeholder="SKU" />
          </el-form-item>
          <el-form-item
            :prop="'items.' + index + '.quantity'"
            :rules="{ required: true, message: '请输入数量', trigger: 'blur' }"
          >
            <el-input-number v-model="item.quantity" :min="1" :max="999999" placeholder="数量" />
          </el-form-item>
          <el-form-item
            :prop="'items.' + index + '.location'"
            :rules="{ required: true, message: '请输入库位', trigger: 'blur' }"
          >
            <el-input v-model="item.location" placeholder="库位" />
          </el-form-item>
          <el-button type="danger" size="small" @click.prevent="removeDispatchItem(index)" :disabled="createForm.items.length <= 1">
            删除
          </el-button>
        </div>

        <el-form-item>
          <el-button type="primary" size="small" @click="addDispatchItem">
            <el-icon><Plus /></el-icon>
            添加商品
          </el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="isCreating" @click="submitCreateTask">
          创建任务
        </el-button>
      </template>
    </el-dialog>
  <!-- 批量调度 -->
  <el-dialog
    v-model="batchShipmentDialogVisible"
    title="批量发货"
    width="800px"
    :close-on-click-modal="false"
  >
    <el-form :inline="true" @submit.prevent="handleSearchShipments">
      <el-form-item label="订单号">
        <el-input v-model="shipmentSearchForm.orderNo" placeholder="请输入订单号" clearable />
      </el-form-item>
      <el-form-item label="物流状态">
        <el-select v-model="shipmentSearchForm.status" placeholder="请选择状态" clearable>
          <el-option label="待发货" value="pending" />
          <el-option label="已发货" value="shipped" />
          <el-option label="运输中" value="in_transit" />
          <el-option label="已送达" value="delivered" />
          <el-option label="已退回" value="returned" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearchShipments">搜索</el-button>
        <el-button @click="handleResetShipmentSearch">重置</el-button>
      </el-form-item>
    </el-form>
    
    <el-table :data="shipmentList" stripe style="width: 100%" @selection-change="handleShipmentSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="orderId" label="订单ID" width="100" align="center" />
      <el-table-column prop="logisticsNo" label="物流单号" width="180" />
      <el-table-column prop="carrierName" label="物流商" width="120" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="
            scope.row.status === 'pending' ? 'info' : 
            scope.row.status === 'shipped' ? 'primary' : 
            scope.row.status === 'in_transit' ? 'warning' : 
            scope.row.status === 'delivered' ? 'success' : 'danger'
          ">
            {{ 
              scope.row.status === 'pending' ? '待发货' : 
              scope.row.status === 'shipped' ? '已发货' : 
              scope.row.status === 'in_transit' ? '运输中' : 
              scope.row.status === 'delivered' ? '已送达' : '已退回'
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="estimatedDeliveryDate" label="预计送达日期" width="180" />
      <el-table-column prop="createdAt" label="创建时间" width="180" />
    </el-table>
    
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="shipmentPagination.page"
        v-model:page-size="shipmentPagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="shipmentPagination.total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleShipmentSizeChange"
        @current-change="handleShipmentPageChange"
      />
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <span class="selected-count">已选择 {{ selectedShipments.length }} 项</span>
        <el-button @click="batchShipmentDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="selectedShipments.length === 0" @click="handleConfirmBatchShipment">
          批量发货
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 物流商管理对话框 -->
  <el-dialog
    v-model="carrierDialogVisible"
    title="物流商管理"
    width="900px"
    :close-on-click-modal="false"
  >
    <div class="carrier-header">
      <el-button type="primary" size="small" @click="handleAddCarrier">
        <el-icon><Plus /></el-icon>
        新增物流商
      </el-button>
    </div>
    
    <el-table :data="carrierList" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="name" label="物流商名称" width="150" />
      <el-table-column prop="code" label="物流商编码" width="120" />
      <el-table-column prop="contact" label="联系人" width="120" />
      <el-table-column prop="phone" label="联系电话" width="150" />
      <el-table-column prop="serviceArea" label="服务区域" width="200" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
            {{ scope.row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="150" fixed="right" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEditCarrier(scope.row)">
            编辑
          </el-button>
          <el-button type="danger" size="small" @click="handleDeleteCarrier(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <template #footer>
      <el-button @click="carrierDialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>

  <!-- 新增/编辑物流商对话框 -->
  <el-dialog
    v-model="carrierFormDialogVisible"
    :title="isEditingCarrier ? '编辑物流商' : '新增物流商'"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="carrierFormRef"
      :model="carrierForm"
      :rules="carrierRules"
      label-width="100px"
    >
      <el-form-item label="物流商名称" prop="name">
        <el-input v-model="carrierForm.name" placeholder="请输入物流商名称" />
      </el-form-item>
      <el-form-item label="物流商编码" prop="code">
        <el-input v-model="carrierForm.code" placeholder="请输入物流商编码" />
      </el-form-item>
      <el-form-item label="联系人" prop="contact">
        <el-input v-model="carrierForm.contact" placeholder="请输入联系人" />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="carrierForm.phone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="服务区域" prop="serviceArea">
        <el-input v-model="carrierForm.serviceArea" placeholder="请输入服务区域" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-switch v-model="carrierForm.status" active-text="启用" inactive-text="禁用" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="carrierFormDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="isSavingCarrier" @click="handleSaveCarrier">
        保存
      </el-button>
    </template>
  </el-dialog>

  <!-- 异常追踪对话框 -->
  <el-dialog
    v-model="exceptionDialogVisible"
    title="异常追踪"
    width="900px"
    :close-on-click-modal="false"
  >
    <el-form :inline="true" @submit.prevent="handleSearchExceptions">
      <el-form-item label="物流单号">
        <el-input v-model="exceptionSearchForm.logisticsNo" placeholder="请输入物流单号" clearable />
      </el-form-item>
      <el-form-item label="异常类型">
        <el-select v-model="exceptionSearchForm.exceptionType" placeholder="请选择异常类型" clearable>
          <el-option label="延迟配送" value="delay" />
          <el-option label="包裹丢失" value="lost" />
          <el-option label="包裹损坏" value="damaged" />
          <el-option label="签收异常" value="signature" />
          <el-option label="地址错误" value="address" />
          <el-option label="其他异常" value="other" />
        </el-select>
      </el-form-item>
      <el-form-item label="处理状态">
        <el-select v-model="exceptionSearchForm.handled" placeholder="请选择状态" clearable>
          <el-option label="未处理" value="false" />
          <el-option label="已处理" value="true" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearchExceptions">搜索</el-button>
        <el-button @click="handleResetExceptionSearch">重置</el-button>
      </el-form-item>
    </el-form>
    
    <el-table :data="exceptionList" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="logisticsNo" label="物流单号" width="180" />
      <el-table-column prop="orderId" label="订单ID" width="100" align="center" />
      <el-table-column prop="exceptionType" label="异常类型" width="120">
        <template #default="scope">
          <el-tag :type="getExceptionTagType(scope.row.exceptionType)">
            {{ getExceptionTypeText(scope.row.exceptionType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="异常描述" width="250" />
      <el-table-column prop="exceptionTime" label="异常发生时间" width="180" />
      <el-table-column prop="handled" label="处理状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.handled ? 'success' : 'danger'">
            {{ scope.row.handled ? '已处理' : '未处理' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="handleTime" label="处理时间" width="180" />
      <el-table-column prop="handler" label="处理人" width="120" />
      <el-table-column label="操作" width="150" fixed="right" align="center">
        <template #default="scope">
          <el-button 
            v-if="!scope.row.handled"
            type="warning" 
            size="small" 
            @click="handleProcessException(scope.row)"
          >
            处理
          </el-button>
          <el-button 
            v-else
            type="primary" 
            size="small" 
            @click="handleViewExceptionDetail(scope.row)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="exceptionPagination.page"
        v-model:page-size="exceptionPagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="exceptionPagination.total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleExceptionSizeChange"
        @current-change="handleExceptionPageChange"
      />
    </div>
    
    <template #footer>
      <el-button @click="exceptionDialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>

  <!-- 处理异常对话框 -->
  <el-dialog
    v-model="processExceptionDialogVisible"
    title="处理异常"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form :model="processExceptionForm" label-width="100px">
      <el-form-item label="物流单号">
        <el-input :value="currentException?.logisticsNo" disabled />
      </el-form-item>
      <el-form-item label="异常类型">
        <el-tag :type="getExceptionTagType(currentException?.exceptionType || '')">
          {{ getExceptionTypeText(currentException?.exceptionType || '') }}
        </el-tag>
      </el-form-item>
      <el-form-item label="异常描述">
        <el-input type="textarea" :value="currentException?.description" disabled rows="3" />
      </el-form-item>
      <el-form-item label="处理方案" prop="solution" required>
        <el-input
          v-model="processExceptionForm.solution"
          type="textarea"
          placeholder="请输入处理方案"
          rows="4"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="processExceptionDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="isProcessingException" @click="handleConfirmProcessException">
        确认处理
      </el-button>
    </template>
  </el-dialog>

  <!-- 创建物流单对话框 -->
  <el-dialog
    v-model="createLogisticsDialogVisible"
    title="创建物流单"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="createLogisticsFormRef"
      :model="createLogisticsForm"
      :rules="createLogisticsRules"
      label-width="100px"
    >
      <el-form-item label="订单ID" prop="orderId">
        <el-input-number
          v-model="createLogisticsForm.orderId"
          :min="1"
          :max="999999"
          placeholder="请输入订单ID"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="物流单号" prop="logisticsNo">
        <el-input v-model="createLogisticsForm.logisticsNo" placeholder="请输入物流单号" />
      </el-form-item>
      <el-form-item label="物流商" prop="carrierName">
        <el-select
          v-model="createLogisticsForm.carrierName"
          placeholder="请选择物流商"
          style="width: 100%"
          filterable
          allow-create
        >
          <el-option
            v-for="carrier in carrierList"
            :key="carrier.id"
            :label="carrier.name"
            :value="carrier.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="跟踪URL" prop="trackingUrl">
        <el-input v-model="createLogisticsForm.trackingUrl" placeholder="请输入物流跟踪URL" />
      </el-form-item>
      <el-form-item label="预计送达" prop="estimatedDeliveryDate">
        <el-date-picker
          v-model="createLogisticsForm.estimatedDeliveryDate"
          type="date"
          placeholder="请选择预计送达日期"
          style="width: 100%"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="createLogisticsDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="isCreatingLogistics" @click="submitCreateLogistics">
        创建
      </el-button>
    </template>
  </el-dialog>

  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Edit, Delete, Check, Van, Box, Warning, Location } from '@element-plus/icons-vue'
import PageLayout from '../components/PageLayout.vue'
import type { DispatchTask, DispatchQueryParams, DispatchCreateRequest, DispatchUpdateRequest, DispatchTaskItem } from '../types/dispatch'
import type { Warehouse } from '../types/wms'
import type { LogisticsInfo, LogisticsCreateRequest } from '../types/logistics'
import { getDispatches, createDispatch, updateDispatch, deleteDispatch, getWarehouses, getLogistics, createLogistics, updateLogistics } from '../utils/api'

interface ExceptionInfo {
  id: number
  logisticsNo: string
  orderId: number
  exceptionType: string
  description: string
  exceptionTime: string
  handled: boolean
  handleTime: string
  handler: string
  solution: string
}

// 搜索表单数据
const searchForm = ref({
  taskNo: '',
  orderId: undefined,
  status: undefined,
  priority: undefined
})

// 分页数据
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 100
})

// 调度任务列表
const taskList = ref<DispatchTask[]>([])

// 仓库列表
const warehouseList = ref<Warehouse[]>([])

// 物流商列表
const carrierList = ref([
  { id: 1, name: '顺丰速运', code: 'SF', contact: '张先生', phone: '400-811-1111', serviceArea: '全国', status: 'active', createdAt: '2024-01-15 10:30:00' },
  { id: 2, name: '中通快递', code: 'ZTO', contact: '李女士', phone: '400-800-0000', serviceArea: '全国', status: 'active', createdAt: '2024-01-15 10:30:00' },
  { id: 3, name: '圆通速递', code: 'YTO', contact: '王先生', phone: '400-888-8888', serviceArea: '全国', status: 'active', createdAt: '2024-01-15 10:30:00' },
  { id: 4, name: '韵达速递', code: 'YD', contact: '赵女士', phone: '400-821-6789', serviceArea: '全国', status: 'active', createdAt: '2024-01-15 10:30:00' },
  { id: 5, name: '申通快递', code: 'STO', contact: '刘先生', phone: '400-889-8888', serviceArea: '全国', status: 'inactive', createdAt: '2024-01-15 10:30:00' }
])

// 异常列表
const exceptionList = ref([
  { 
    id: 1, 
    logisticsNo: 'SF1234567890', 
    orderId: 1001, 
    exceptionType: 'delay', 
    description: '包裹在转运中心滞留超过48小时', 
    exceptionTime: '2024-01-20 14:30:00',
    handled: false,
    handleTime: '',
    handler: '',
    solution: ''
  },
  { 
    id: 2, 
    logisticsNo: 'ZTO0987654321', 
    orderId: 1002, 
    exceptionType: 'damaged', 
    description: '外包装破损，商品可能受损', 
    exceptionTime: '2024-01-19 09:15:00',
    handled: true,
    handleTime: '2024-01-19 16:00:00',
    handler: '张三',
    solution: '已联系快递公司核实，预计2个工作日内处理完毕'
  }
])

// 创建物流单相关
const createLogisticsDialogVisible = ref(false)
const isCreatingLogistics = ref(false)
const createLogisticsFormRef = ref()
const createLogisticsForm = ref({
  orderId: undefined as number | undefined,
  logisticsNo: '',
  carrierName: '',
  trackingUrl: '',
  estimatedDeliveryDate: ''
})

const createLogisticsRules = {
  orderId: [{ required: true, message: '请输入订单ID', trigger: 'blur' }],
  logisticsNo: [{ required: true, message: '请输入物流单号', trigger: 'blur' }],
  carrierName: [{ required: true, message: '请选择物流商', trigger: 'change' }],
  estimatedDeliveryDate: [{ required: true, message: '请选择预计送达日期', trigger: 'change' }]
}

// 批量发货相关
const batchShipmentDialogVisible = ref(false)
const shipmentList = ref<LogisticsInfo[]>([])
const selectedShipments = ref<LogisticsInfo[]>([])
const shipmentSearchForm = ref({
  orderNo: '',
  status: ''
})
const shipmentPagination = ref({
  page: 1,
  pageSize: 10,
  total: 50
})

// 物流商管理相关
const carrierDialogVisible = ref(false)
const carrierFormDialogVisible = ref(false)
const isEditingCarrier = ref(false)
const isSavingCarrier = ref(false)
const carrierFormRef = ref()
const carrierForm = ref({
  id: 0,
  name: '',
  code: '',
  contact: '',
  phone: '',
  serviceArea: '',
  status: true
})

const carrierRules = {
  name: [{ required: true, message: '请输入物流商名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入物流商编码', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

// 异常追踪相关
const exceptionDialogVisible = ref(false)
const processExceptionDialogVisible = ref(false)
const isProcessingException = ref(false)
const currentException = ref<any>(null)
const exceptionSearchForm = ref({
  logisticsNo: '',
  exceptionType: '',
  handled: ''
})
const exceptionPagination = ref({
  page: 1,
  pageSize: 10,
  total: 30
})

const processExceptionForm = ref({
  solution: ''
})

// 创建任务相关
const createDialogVisible = ref(false)
const isCreating = ref(false)
const createFormRef = ref()
const createForm = ref({
  orderId: undefined as number | undefined,
  warehouseId: undefined as number | undefined,
  priority: 'medium' as 'low' | 'medium' | 'high',
  requiredQuantity: 1,
  items: [
    { productName: '', sku: '', quantity: 1, location: '' }
  ] as Omit<DispatchTaskItem, 'id' | 'taskId'>[]
})

const createRules = {
  orderId: [{ required: true, message: '请输入订单ID', trigger: 'blur' }],
  warehouseId: [{ required: true, message: '请选择仓库', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  requiredQuantity: [{ required: true, message: '请输入需求数量', trigger: 'blur' }]
}

// 编辑表单相关
const editDialogVisible = ref(false)
const editForm = ref({
  id: 0,
  taskNo: '',
  orderId: '',
  warehouseId: '',
  warehouseName: '',
  status: 'pending',
  priority: 'medium',
  requiredQuantity: 1,
  dispatchedQuantity: 0,
  operator: '',
  startTime: '',
  endTime: ''
})
// 表单引用，用于后续验证
const isEditLoading = ref(false)

// 查看详情相关
const detailDialogVisible = ref(false)
const currentTask = ref<DispatchTask | null>(null)

// 搜索
const handleSearch = async () => {
  pagination.value.page = 1
  await fetchDispatchTasks()
}

// 获取调度任务列表
const fetchDispatchTasks = async () => {
  const params: DispatchQueryParams = {
    taskNo: searchForm.value.taskNo,
    orderId: searchForm.value.orderId,
    status: searchForm.value.status,
    priority: searchForm.value.priority,
    page: pagination.value.page,
    pageSize: pagination.value.pageSize
  }
  
  try {
    const response = await getDispatches(params)
    taskList.value = response.list
    pagination.value.total = response.total
  } catch (error) {
    ElMessage.error(`获取调度任务失败: ${(error as Error).message}`)
  }
}

// 重置
const handleReset = async () => {
  searchForm.value = {
    taskNo: '',
    orderId: undefined,
    status: undefined,
    priority: undefined
  }
  pagination.value.page = 1
  await fetchDispatchTasks()
}

// 分页大小变化
const handleSizeChange = async (size: number) => {
  pagination.value.pageSize = size
  await fetchDispatchTasks()
}

// 当前页码变化
const handleCurrentChange = async (page: number) => {
  pagination.value.page = page
  await fetchDispatchTasks()
}

// 创建调度任务
const handleAddTask = async () => {
  await fetchWarehouses()
  createForm.value = {
    orderId: undefined,
    warehouseId: undefined,
    priority: 'medium',
    requiredQuantity: 1,
    items: [
      { productName: '', sku: '', quantity: 1, location: '' }
    ]
  }
  createDialogVisible.value = true
}

// 获取仓库列表
const fetchWarehouses = async () => {
  try {
    const response = await getWarehouses({ page: 1, pageSize: 100 })
    warehouseList.value = response.list
  } catch (error) {
    console.error('获取仓库列表失败:', error)
  }
}

// 添加调度商品项
const addDispatchItem = () => {
  createForm.value.items.push({
    productName: '',
    sku: '',
    quantity: 1,
    location: ''
  })
}

// 删除调度商品项
const removeDispatchItem = (index: number) => {
  createForm.value.items.splice(index, 1)
}

// 提交创建任务
const submitCreateTask = async () => {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()

    const newTask: DispatchCreateRequest = {
      orderId: createForm.value.orderId!,
      warehouseId: createForm.value.warehouseId!,
      priority: createForm.value.priority,
      requiredQuantity: createForm.value.requiredQuantity,
      items: createForm.value.items.filter(item => 
        item.productName && item.sku && item.location
      )
    }

    isCreating.value = true
    await createDispatch(newTask)
    ElMessage.success('调度任务创建成功')
    createDialogVisible.value = false
    await fetchDispatchTasks()
  } catch (error) {
    if (error !== false) {
      ElMessage.error(`创建调度任务失败: ${(error as Error).message}`)
    }
  } finally {
    isCreating.value = false
  }
}

// 创建物流单
const handleCreateLogistics = () => {
  createLogisticsForm.value = {
    orderId: undefined,
    logisticsNo: '',
    carrierName: '',
    trackingUrl: '',
    estimatedDeliveryDate: ''
  }
  createLogisticsDialogVisible.value = true
}

// 提交创建物流单
const submitCreateLogistics = async () => {
  if (!createLogisticsFormRef.value) return

  try {
    await createLogisticsFormRef.value.validate()

    const newLogistics: LogisticsCreateRequest = {
      orderId: createLogisticsForm.value.orderId!,
      logisticsNo: createLogisticsForm.value.logisticsNo,
      carrierName: createLogisticsForm.value.carrierName,
      trackingUrl: createLogisticsForm.value.trackingUrl,
      estimatedDeliveryDate: createLogisticsForm.value.estimatedDeliveryDate
    }

    isCreatingLogistics.value = true
    await createLogistics(newLogistics)
    ElMessage.success('物流单创建成功')
    createLogisticsDialogVisible.value = false
  } catch (error) {
    if (error !== false) {
      ElMessage.error(`创建物流单失败: ${(error as Error).message}`)
    }
  } finally {
    isCreatingLogistics.value = false
  }
}

// 批量发货
const handleBatchShipment = async () => {
  shipmentSearchForm.value = {
    orderNo: '',
    status: ''
  }
  shipmentPagination.value = {
    page: 1,
    pageSize: 10,
    total: 50
  }
  selectedShipments.value = []
  
  shipmentList.value = [
    { id: 1, orderId: 1001, logisticsNo: 'SF1234567890', carrierName: '顺丰速运', status: 'pending', trackingUrl: 'https://www.sf-express.com/track/SF1234567890', estimatedDeliveryDate: '2024-01-25', createdAt: '2024-01-20 10:30:00', updatedAt: '2024-01-20 10:30:00' },
    { id: 2, orderId: 1002, logisticsNo: 'ZTO0987654321', carrierName: '中通快递', status: 'pending', trackingUrl: 'https://www.zto.com/track/ZTO0987654321', estimatedDeliveryDate: '2024-01-26', createdAt: '2024-01-20 11:00:00', updatedAt: '2024-01-20 11:00:00' },
    { id: 3, orderId: 1003, logisticsNo: 'YTO1122334455', carrierName: '圆通速递', status: 'shipped', trackingUrl: 'https://www.yto.net.cn/track/YTO1122334455', estimatedDeliveryDate: '2024-01-24', createdAt: '2024-01-19 14:00:00', updatedAt: '2024-01-20 08:00:00' },
    { id: 4, orderId: 1004, logisticsNo: 'YD5566778899', carrierName: '韵达速递', status: 'pending', trackingUrl: 'https://www.yundaex.com/track/YD5566778899', estimatedDeliveryDate: '2024-01-27', createdAt: '2024-01-20 15:30:00', updatedAt: '2024-01-20 15:30:00' },
    { id: 5, orderId: 1005, logisticsNo: 'STO9988776655', carrierName: '申通快递', status: 'in_transit', trackingUrl: 'https://www.sto.cn/track/STO9988776655', estimatedDeliveryDate: '2024-01-23', createdAt: '2024-01-18 09:00:00', updatedAt: '2024-01-20 06:00:00' }
  ]
  
  batchShipmentDialogVisible.value = true
}

// 搜索发货单
const handleSearchShipments = async () => {
  shipmentPagination.value.page = 1
  await fetchShipmentList()
}

// 重置发货搜索
const handleResetShipmentSearch = () => {
  shipmentSearchForm.value = {
    orderNo: '',
    status: ''
  }
  shipmentPagination.value.page = 1
}

// 获取发货列表
const fetchShipmentList = async () => {
  try {
    const response = await getLogistics({
      page: shipmentPagination.value.page,
      pageSize: shipmentPagination.value.pageSize,
      status: shipmentSearchForm.value.status as any,
      orderId: shipmentSearchForm.value.orderNo ? parseInt(shipmentSearchForm.value.orderNo) : undefined
    })
    shipmentList.value = response.list
    shipmentPagination.value.total = response.total
  } catch (error) {
    ElMessage.error(`获取发货列表失败: ${(error as Error).message}`)
  }
}

// 发货选择变化
const handleShipmentSelectionChange = (selection: LogisticsInfo[]) => {
  selectedShipments.value = selection
}

// 发货分页大小变化
const handleShipmentSizeChange = async (size: number) => {
  shipmentPagination.value.pageSize = size
  await fetchShipmentList()
}

// 发货页码变化
const handleShipmentPageChange = async (page: number) => {
  shipmentPagination.value.page = page
  await fetchShipmentList()
}

// 确认批量发货
const handleConfirmBatchShipment = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要批量发货 ${selectedShipments.value.length} 个物流单吗？`,
      '批量发货确认',
      {
        confirmButtonText: '确认发货',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    for (const shipment of selectedShipments.value) {
      if (shipment.status === 'pending') {
        await updateLogistics({
          id: shipment.id,
          status: 'shipped'
        })
      }
    }

    ElMessage.success(`成功发货 ${selectedShipments.value.length} 个物流单`)
    batchShipmentDialogVisible.value = false
    await fetchShipmentList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`批量发货失败: ${(error as Error).message}`)
    }
  }
}

// 物流商管理
const handleCarrierManagement = () => {
  carrierDialogVisible.value = true
}

// 新增物流商
const handleAddCarrier = () => {
  carrierForm.value = {
    id: 0,
    name: '',
    code: '',
    contact: '',
    phone: '',
    serviceArea: '',
    status: true
  }
  isEditingCarrier.value = false
  carrierFormDialogVisible.value = true
}

// 编辑物流商
const handleEditCarrier = (carrier: any) => {
  carrierForm.value = {
    id: carrier.id,
    name: carrier.name,
    code: carrier.code,
    contact: carrier.contact,
    phone: carrier.phone,
    serviceArea: carrier.serviceArea,
    status: carrier.status === 'active'
  }
  isEditingCarrier.value = true
  carrierFormDialogVisible.value = true
}

// 删除物流商
const handleDeleteCarrier = async (carrier: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除物流商"${carrier.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const index = carrierList.value.findIndex(c => c.id === carrier.id)
    if (index > -1) {
      carrierList.value.splice(index, 1)
    }

    ElMessage.success('物流商删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`删除物流商失败: ${(error as Error).message}`)
    }
  }
}

// 保存物流商
const handleSaveCarrier = async () => {
  if (!carrierFormRef.value) return

  try {
    await carrierFormRef.value.validate()

    if (isEditingCarrier.value) {
      const index = carrierList.value.findIndex(c => c.id === carrierForm.value.id)
      if (index > -1) {
        const currentCarrier = carrierList.value[index]!
        carrierList.value[index] = {
          id: currentCarrier.id,
          name: carrierForm.value.name,
          code: carrierForm.value.code,
          contact: carrierForm.value.contact,
          phone: carrierForm.value.phone,
          serviceArea: carrierForm.value.serviceArea,
          status: carrierForm.value.status ? 'active' : 'inactive',
          createdAt: currentCarrier.createdAt
        }
      }
      ElMessage.success('物流商更新成功')
    } else {
      const newCarrier = {
        id: Date.now() as number,
        name: carrierForm.value.name,
        code: carrierForm.value.code,
        contact: carrierForm.value.contact,
        phone: carrierForm.value.phone,
        serviceArea: carrierForm.value.serviceArea,
        status: carrierForm.value.status ? 'active' : 'inactive',
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
      }
      carrierList.value.push(newCarrier as any)
      ElMessage.success('物流商添加成功')
    }

    carrierFormDialogVisible.value = false
  } catch (error) {
    if (error !== false) {
      ElMessage.error(`保存物流商失败: ${(error as Error).message}`)
    }
  }
}

// 异常追踪
const handleExceptionTracking = () => {
  exceptionSearchForm.value = {
    logisticsNo: '',
    exceptionType: '',
    handled: ''
  }
  exceptionPagination.value = {
    page: 1,
    pageSize: 10,
    total: 30
  }
  exceptionDialogVisible.value = true
}

// 搜索异常
const handleSearchExceptions = () => {
  exceptionPagination.value.page = 1
}

// 重置异常搜索
const handleResetExceptionSearch = () => {
  exceptionSearchForm.value = {
    logisticsNo: '',
    exceptionType: '',
    handled: ''
  }
  exceptionPagination.value.page = 1
}

// 异常分页大小变化
const handleExceptionSizeChange = (size: number) => {
  exceptionPagination.value.pageSize = size
}

// 异常页码变化
const handleExceptionPageChange = (page: number) => {
  exceptionPagination.value.page = page
}

// 处理异常
const handleProcessException = (exception: any) => {
  currentException.value = exception
  processExceptionForm.value.solution = ''
  processExceptionDialogVisible.value = true
}

// 查看异常详情
const handleViewExceptionDetail = (exception: any) => {
  currentException.value = exception
  processExceptionForm.value.solution = exception.solution || ''
  processExceptionDialogVisible.value = true
}

// 确认处理异常
const handleConfirmProcessException = async () => {
  if (!processExceptionForm.value.solution.trim()) {
    ElMessage.warning('请输入处理方案')
    return
  }

  try {
    isProcessingException.value = true

    const index = exceptionList.value.findIndex(e => e.id === currentException.value.id)
    if (index > -1) {
      exceptionList.value[index] = {
        ...exceptionList.value[index],
        handled: true,
        handleTime: new Date().toLocaleString('zh-CN', { hour12: false }),
        handler: '当前用户',
        solution: processExceptionForm.value.solution
      } as ExceptionInfo
    }

    ElMessage.success('异常处理成功')
    processExceptionDialogVisible.value = false
  } catch (error) {
    ElMessage.error(`处理异常失败: ${(error as Error).message}`)
  } finally {
    isProcessingException.value = false
  }
}

// 获取异常类型标签颜色
const getExceptionTagType = (type: string): string => {
  const typeMap: Record<string, string> = {
    delay: 'warning',
    lost: 'danger',
    damaged: 'danger',
    signature: 'info',
    address: 'info',
    other: ''
  }
  return typeMap[type] || ''
}

// 获取异常类型文本
const getExceptionTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    delay: '延迟配送',
    lost: '包裹丢失',
    damaged: '包裹损坏',
    signature: '签收异常',
    address: '地址错误',
    other: '其他异常'
  }
  return typeMap[type] || type
}

// 查看任务详情
const handleViewDetail = (task: DispatchTask) => {
  currentTask.value = task
  detailDialogVisible.value = true
}

// 编辑任务
const handleEditTask = (task: DispatchTask) => {
  // 初始化编辑表单数据
  editForm.value = {
    id: task.id,
    taskNo: task.taskNo,
    orderId: task.orderId.toString(),
    warehouseId: task.warehouseId.toString(),
    warehouseName: task.warehouseName,
    status: task.status,
    priority: task.priority,
    requiredQuantity: task.requiredQuantity,
    dispatchedQuantity: task.dispatchedQuantity,
    operator: task.operator || '',
    startTime: task.startTime || '',
    endTime: task.endTime || ''
  }
  editDialogVisible.value = true
}

// 确认编辑任务
const confirmEditTask = async () => {
  try {
    // 表单验证
    const requiredFields = ['orderId', 'warehouseId', 'priority', 'requiredQuantity']
    for (const field of requiredFields) {
      if (!editForm.value[field as keyof typeof editForm.value]) {
        ElMessage.warning(`请填写${field === 'orderId' ? '订单ID' : field === 'warehouseId' ? '仓库' : field === 'priority' ? '优先级' : '需求数量'}`)
        return
      }
    }

    // 验证数值字段
    if (parseInt(editForm.value.orderId) <= 0) {
      ElMessage.warning('订单ID必须为正整数')
      return
    }

    if (parseInt(editForm.value.warehouseId) <= 0) {
      ElMessage.warning('请选择有效仓库')
      return
    }

    if (editForm.value.requiredQuantity <= 0) {
      ElMessage.warning('需求数量必须大于0')
      return
    }

    // 创建更新请求数据
    const updateData: DispatchUpdateRequest = {
      id: editForm.value.id,
      orderId: parseInt(editForm.value.orderId),
      warehouseId: parseInt(editForm.value.warehouseId),
      status: editForm.value.status as DispatchUpdateRequest['status'],
      priority: editForm.value.priority as DispatchUpdateRequest['priority'],
      requiredQuantity: editForm.value.requiredQuantity,
      dispatchedQuantity: editForm.value.dispatchedQuantity,
      operator: editForm.value.operator,
      startTime: editForm.value.startTime || undefined,
      endTime: editForm.value.endTime || undefined
    }

    // 如果开始时间和结束时间格式不正确，清除它们
    if (updateData.startTime && !updateData.startTime.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      delete updateData.startTime
    }
    
    if (updateData.endTime && !updateData.endTime.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      delete updateData.endTime
    }

    // 调用API更新任务
    await updateDispatch(updateData)
    
    ElMessage.success('调度任务更新成功')
    editDialogVisible.value = false // 关闭对话框
    await fetchDispatchTasks() // 刷新任务列表
  } catch (error) {
    ElMessage.error(`更新调度任务失败: ${(error as Error).message}`)
    console.error('更新调度任务失败:', error)
  }
}

// 取消任务
const handleCancelTask = async (task: DispatchTask) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消该调度任务吗？此操作不可撤销。',
      '取消任务确认',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '保留任务',
        type: 'warning',
        customClass: 'cancel-task-message-box',
        confirmButtonClass: 'cancel-confirm-btn',
        distinguishCancelAndClose: true,
        autofocus: false,
      }
    )
    
    await deleteDispatch(task.id)
    ElMessage.success('任务已取消')
    await fetchDispatchTasks()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(`取消调度任务失败: ${(error as Error).message}`)
      console.error('取消调度任务失败:', error)
    }
  }
}

// 执行任务
const handleExecuteTask = async (task: DispatchTask) => {
  // 创建符合接口要求的执行数据
  const executedTask: DispatchUpdateRequest = {
    id: task.id,
    status: 'completed',
    dispatchedQuantity: task.requiredQuantity || 0,
    endTime: new Date().toISOString()
  }
  
  try {
    await updateDispatch(executedTask)
    ElMessage.success('调度任务执行成功')
    await fetchDispatchTasks() // 刷新任务列表
  } catch (error) {
    ElMessage.error(`执行调度任务失败: ${(error as Error).message}`)
  }
}

// 初始化数据
onMounted(async () => {
  await fetchDispatchTasks()
})
</script>

<style scoped>
/* 搜索表单样式 */
.search-form {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
}

.pagination-container {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: flex-end;
}

/* 操作按钮容器 - 现代化设计 */
.table-action-buttons {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs);
  min-width: 280px;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.table-action-buttons::-webkit-scrollbar {
  display: none;
}

/* 按钮样式优化 */
.table-action-buttons .el-button {
  flex-shrink: 0;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.table-action-buttons .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-action-buttons .el-button:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 平板设备优化 */
@media (max-width: 1024px) {
  .table-action-buttons {
    gap: var(--spacing-xs);
    min-width: 240px;
  }
  
  .table-action-buttons .el-button {
    padding: var(--spacing-xs);
    font-size: 12px;
  }
  
  .table-action-buttons .el-button .el-icon {
    font-size: 14px;
  }
}

/* 手机设备优化 */
@media (max-width: 768px) {
  .table-action-buttons {
    gap: var(--spacing-xs);
    min-width: 200px;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  
  .table-action-buttons .el-button {
    min-width: 60px;
    padding: var(--spacing-xs);
    font-size: 11px;
  }
}

/* 超小屏幕设备 */
@media (max-width: 480px) {
  .table-action-buttons {
    min-width: 180px;
    gap: 2px;
  }
  
  .table-action-buttons .el-button {
    min-width: 50px;
    padding: 2px 4px;
    font-size: 10px;
  }
}

.dispatch-item-form {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  align-items: flex-start;
  padding: var(--spacing-md);
  background-color: var(--bg-secondary, #f5f7fa);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
}

.dispatch-item-form .el-form-item {
  margin-bottom: 0;
  flex: 1;
  min-width: 150px;
}

.dispatch-item-form .el-button {
  margin-top: 0;
}

.carrier-header {
  margin-bottom: var(--spacing-md);
}

.selected-count {
  margin-right: auto;
  color: var(--text-secondary, #909399);
  font-size: var(--font-size-sm);
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>